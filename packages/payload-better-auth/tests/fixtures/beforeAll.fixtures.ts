import dotenv from 'dotenv'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { setSuite, type Suite } from './suite.ctx'
import { createBetterAuthInstance } from '../../src/better-auth/instance'
import { betterAuthPluginConfig } from '../../dev/payload.plugins'
import { NextRESTClient } from '../../dev/helpers/NextRESTClient'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const beforeAllFixtures = () => async () => {
  const suite: Record<string, any> = {
    memoryDB: undefined,
    payload: undefined,
    restClient: undefined,
    betterAuth: undefined,
    betterAuthEndpoints: undefined,
    betterAuthTables: undefined,
  }
  process.env.DISABLE_PAYLOAD_HMR = 'true'
  process.env.PAYLOAD_DROP_DATABASE = 'true'

  dotenv.config({
    path: path.resolve(dirname, '../../dev/.env'),
  })
  // console.log('DEV .env PATH =====> ', path.resolve(dirname, '../../dev/.env'))
  // console.log('process.env.DATABASE_URI =====> ', process.env.DATABASE_URI)

  // Force database to be in memory and don't use the local one for test
  console.log('Starting memory database')
  suite.memoryDB = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      dbName: 'payloadmemory',
      storageEngine: 'wiredTiger',
    },
  })
  await suite.memoryDB.waitUntilRunning()
  // console.log('Memory database started')

  process.env.DATABASE_URI = `${suite.memoryDB.getUri()}&retryWrites=true`

  // IMPORTANT: payload.config should be always imported dynamically since it uses the process.env.DATABASE_URI
  // and we want it to use our replaced uri for tests with in memory mongodb.
  const { default: config } = await import('../../dev/payload.config')

  suite.payload = await getPayload({ config })
  suite.restClient = new NextRESTClient(suite.payload.config)
  suite.betterAuth = createBetterAuthInstance({
    pluginOptions: betterAuthPluginConfig,
    payload: suite.payload,
  })
  suite.betterAuthEndpoints = getEndpoints(
    suite.betterAuth.$context,
    suite.betterAuth.options,
  )
  suite.betterAuthTables = getAuthTables(suite.betterAuth.options)

  setSuite(suite as Suite)

  // console.log('suite.payload', suite.payload)
  // console.log('suite.restClient', suite.restClient)
}
