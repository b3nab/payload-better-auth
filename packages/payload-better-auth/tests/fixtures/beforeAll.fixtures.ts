import dotenv from 'dotenv'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { vi } from 'vitest'
import type { AuthContext } from 'better-auth'
import { getPayload } from 'payload'
import { loadEnv } from 'payload/node'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { bootSuite, setSuite } from './suite.ctx.js'
import { createBetterAuthInstance } from '../../src/better-auth/instance.js'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
// import payloadConfig from 'packages/payload-better-auth/dev/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const beforeAllFixtures = ({
  dropDatabase = false,
  idType = 'uuid',
  boot = 'dev',
  dbName = 'payload-better-auth-test-suite-db',
}: {
  dropDatabase?: boolean
  idType?: 'serial' | 'uuid'
  /**
   * 'dev' boots the full dev config (plugin included) and builds the
   * better-auth instance for the integration tests; 'adapter' boots the
   * minimal config (base + plugin with the harness options) that the
   * adapter tests migrate over, keeping the heavy dev module graph out of
   * those files.
   */
  boot?: 'dev' | 'adapter'
  /** one db name per test file */
  dbName?: string
} = {}) => async () => {
  // Clear any existing suite to prevent conflicts
  // clearSuite()

  process.env.DISABLE_PAYLOAD_HMR = 'true'
  process.env.PAYLOAD_DROP_DATABASE = dropDatabase ? 'true' : 'false'

  dotenv.config({
    path: path.resolve(dirname, '../../dev/.env'),
  })
  // loadEnv( path.resolve(dirname, '../../dev'))
  // console.log('DEV .env PATH =====> ', path.resolve(dirname, '../../dev/.env'))

  // Use testcontainers PostgreSQL with explicit image
  // console.log('Starting PostgreSQL container...')
  // test-tuned postgres: data lives in RAM and nothing waits for disk —
  // the suites are almost pure writes (seeds, per-row cleanups, DDL pushes
  // on every migration) and fsync through the Docker VM dominates the run.
  // No reuse: ryuk reaps every container at process death, nothing hangs
  const memoryDB = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase(dbName)
    .withUsername('postgres')
    .withPassword('postgres')
    .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
    .withCommand([
      'postgres',
      '-c', 'fsync=off',
      '-c', 'synchronous_commit=off',
      '-c', 'full_page_writes=off',
    ])
    .start()

  vi.stubEnv('DATABASE_URI', memoryDB.getConnectionUri())
  console.log('PostgreSQL container started')
  console.log('Database URI: ', process.env.DATABASE_URI)

  if (boot === 'adapter') {
    // a reused container still holds the previous run's schema: bootSuite's
    // drop + forced push starts it clean
    await bootSuite({ idType, betterAuthOptions: {}, memoryDB })
    return
  }

  // IMPORTANT: payload.config should be always imported dynamically since it uses the process.env.DATABASE_URI
  // and we want it to use our replaced uri for tests with in memory pglite.
  // (the plugin options too: their module graph stays out of the adapter files)
  const { betterAuthPluginConfig } = await import(
    '../../dev/payload-better-auth.config.js'
  )
  const config = await import('../../dev/payload.config.js')
  const payloadConfig = await config.buildDevConfig({ idType })
  const payload = await getPayload({ config: payloadConfig })
  // restClient = new NextRESTClient(payload.config)
  const betterAuth = createBetterAuthInstance({
    pluginOptions: betterAuthPluginConfig,
    payload: payload,
  })
  // same pattern as src/plugin.ts: the tests only enumerate paths/methods,
  // and getEndpoints awaits the context inside the handlers only, so this
  // promise is intentionally never resolved.
  const enumerationOnlyContext = new Promise<AuthContext>(() => {})
  const betterAuthEndpoints = getEndpoints(
    enumerationOnlyContext,
    betterAuth.options,
  )
  const betterAuthTables = getAuthTables(betterAuth.options)

  setSuite({
    payload,
    idType,
    memoryDB,
    betterAuth,
    betterAuthEndpoints,
    betterAuthTables
  })

  // console.log('suite.payload', suite.payload)
  // console.log('suite.restClient', suite.restClient)
}
