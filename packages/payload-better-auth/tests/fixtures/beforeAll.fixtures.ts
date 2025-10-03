import dotenv from 'dotenv'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { vi } from 'vitest'
import { getPayload } from 'payload'
import { loadEnv } from 'payload/node'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { getSuite, setSuite, clearSuite, type Suite } from './suite.ctx'
import { createBetterAuthInstance } from '../../src/better-auth/instance'
import { betterAuthPluginConfig } from '../../dev/payload-better-auth.config'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
// import payloadConfig from 'packages/payload-better-auth/dev/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const beforeAllFixtures = (dropDatabase = false) => async () => {
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
  const memoryDB = await new PostgreSqlContainer('postgres:16')
    .withDatabase('payload-better-auth-test-suite-db')
    .withUsername('postgres')
    .withPassword('postgres')
    .start()

  vi.stubEnv('DATABASE_URI', memoryDB.getConnectionUri())
  console.log('PostgreSQL container started')
  console.log('Database URI: ', process.env.DATABASE_URI)

  // IMPORTANT: payload.config should be always imported dynamically since it uses the process.env.DATABASE_URI
  // and we want it to use our replaced uri for tests with in memory pglite.
  const config = await import('../../dev/payload.config')
  const payloadConfig = config.default
  const payload = await getPayload({ config: payloadConfig })
  // restClient = new NextRESTClient(payload.config)
  const betterAuth = createBetterAuthInstance({
    pluginOptions: betterAuthPluginConfig,
    payload: payload,
  })
  const betterAuthEndpoints = getEndpoints(
    betterAuth.$context,
    betterAuth.options,
  )
  const betterAuthTables = getAuthTables(betterAuth.options)

  setSuite({
    payload,
    memoryDB,
    betterAuth,
    betterAuthEndpoints,
    betterAuthTables
  })

  // console.log('suite.payload', suite.payload)
  // console.log('suite.restClient', suite.restClient)
}
