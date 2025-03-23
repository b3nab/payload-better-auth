import dotenv from 'dotenv'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'
import { NextRESTClient } from '@/../../apps/demo/dev/helpers/NextRESTClient'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { generateBetterAuthOptions } from '../../src/better-auth/generate-options'
import { setSuite, type Suite } from './suite.ctx.js'
import { betterAuthPluginConfig } from '@/../../apps/demo/dev/payload.plugins'

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
    path: path.resolve(dirname, '../dev/.env'),
  })

  if (!process.env.DATABASE_URI) {
    // console.log('Starting memory database')
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
  }

  const { default: config } = await import('@/../../apps/demo/dev/payload.config')

  suite.payload = await getPayload({ config })
  suite.restClient = new NextRESTClient(suite.payload.config)
  suite.betterAuth = betterAuth(
    generateBetterAuthOptions(betterAuthPluginConfig),
  )
  suite.betterAuthEndpoints = getEndpoints(
    suite.betterAuth.$context,
    generateBetterAuthOptions(betterAuthPluginConfig),
  )
  suite.betterAuthTables = getAuthTables(
    generateBetterAuthOptions(betterAuthPluginConfig),
  )

  setSuite(suite as Suite)

  // console.log('suite.payload', suite.payload)
  // console.log('suite.restClient', suite.restClient)
}
