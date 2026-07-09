import { BasePayload, type Payload } from 'payload'
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import type { BetterAuthOptions } from 'better-auth'
import type { getEndpoints } from 'better-auth/api'
import type { BetterAuthDBSchema } from 'better-auth/db'
import type { InferBetterAuthInstance } from '../../src/better-auth/instance.js'
import type { betterAuthPluginConfig } from '../../dev/payload-better-auth.config.js'
import {
  buildAdapterPayloadConfig,
  withForcedPush,
} from './adapterPayload.config.js'

type TestBetterAuth = InferBetterAuthInstance<typeof betterAuthPluginConfig>

export type Suite = {
  memoryDB: StartedPostgreSqlContainer
  payload: Payload
  /** id shape of the current boot; migrations reboot payload with the same shape */
  idType: 'serial' | 'uuid'
  /** present only on the 'dev' boot (integration tests) */
  betterAuth?: TestBetterAuth
  betterAuthEndpoints?: ReturnType<typeof getEndpoints<TestBetterAuth['options']>>
  betterAuthTables?: BetterAuthDBSchema
}

let suite: Suite | undefined

export const hasSuite = () => typeof suite !== 'undefined'

export const getSuite = (): Suite => {
  if (typeof suite === 'undefined') {
    throw new Error('Suite not initialized')
  }
  return suite
}

export const setSuite = (newSuite: Suite) => {
  if (!newSuite) return
  suite = newSuite
}

export const clearSuite = async () => {
  // console.log('\n\n============================\nClearing suite\n============================\n\n')
  // console.log('process.env.DATABASE_URI =====> ', process.env.DATABASE_URI)
  await teardownWorld(suite?.payload)
  // clearSuite tears down the world (payload + pool) only: the container is
  // shared by every world of the test file and dies with the process (ryuk)
  suite = undefined
}

// nothing must survive a world: payload.destroy() clears the db adapter but
// never ends the pool, and the pool is what actually holds the pg
// connections — a world left hanging leaks them, one step per migration.
// Idempotent (pool.ended): a boot failure must not turn the final clearSuite
// into a second end on the same pool
const teardownWorld = async (payload?: Payload) => {
  if (!payload) return
  await payload.destroy()
  const pool = Reflect.get(payload.db, 'pool') as
    | {
        end?: () => Promise<void>
        ended?: boolean
        _clients?: Array<{ release?: (destroy?: boolean) => void }>
      }
    | undefined
  if (!pool || pool.ended) return
  // payload's connectWithReconnect keeps its connection-test client checked
  // out forever (never released): a graceful end would wait for it — force
  // every client back first (already-released ones throw, and that's fine)
  for (const client of pool._clients ?? []) {
    try {
      client.release?.(true)
    } catch {
      // idle clients have no pending release
    }
  }
  await pool.end?.()
}

/**
 * The one place an adapter-suite world is born: tears down the previous
 * payload (pool included) and boots a fresh one on the suite container.
 * beforeAll passes memoryDB on the first boot; runMigrations reboots with
 * the harness options. BasePayload is used directly because getPayload
 * caches per process and would hand back a destroyed instance.
 */
export const bootSuite = async ({
  idType,
  betterAuthOptions,
  memoryDB,
}: {
  idType: 'serial' | 'uuid'
  betterAuthOptions: BetterAuthOptions
  /** first boot only: the container every world of this suite lives in */
  memoryDB?: StartedPostgreSqlContainer
}) => {
  const container = memoryDB ?? getSuite().memoryDB
  // the old world is dead from this point on, whatever happens to the boot:
  // clearSuite must never tear the same instance down a second time
  const previous = suite?.payload
  suite = undefined
  await teardownWorld(previous)
  const config = await buildAdapterPayloadConfig({ idType, betterAuthOptions })
  const payload = await withForcedPush(() => new BasePayload().init({ config }))
  setSuite({ memoryDB: container, idType, payload })
}
