import dotenv from 'dotenv'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '../../dev/payload.config'
import { getPayload } from 'payload'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { getSuite, setSuite, clearSuite, type Suite } from './suite.ctx'
import { createBetterAuthInstance } from '../../src/better-auth/instance'
import { betterAuthPluginConfig } from '../../dev/payload-better-auth.config'
import { NextRESTClient } from '../../dev/helpers/NextRESTClient'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketHandler } from '@electric-sql/pglite-socket'
import { createServer, Socket } from 'net'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const beforeAllFixtures = (dropDatabase = false) => async () => {
  try {
    if(getSuite()) {
      return
    }
  } catch (error) {
    console.log('Suite not initialized, creating new suite')
  }

  // Clear any existing suite to prevent conflicts
  clearSuite()

  const suite: Record<string, any> = {
    memoryDB: undefined,
    payload: undefined,
    restClient: undefined,
    betterAuth: undefined,
    betterAuthEndpoints: undefined,
    betterAuthTables: undefined,
  }
  process.env.DISABLE_PAYLOAD_HMR = 'true'
  process.env.PAYLOAD_DROP_DATABASE = dropDatabase ? 'true' : 'false'

  dotenv.config({
    path: path.resolve(dirname, '../../dev/.env'),
  })
  // console.log('DEV .env PATH =====> ', path.resolve(dirname, '../../dev/.env'))

  // Create a PGlite instance
  const db = await PGlite.create()

  // Create a handler
  const handler = new PGLiteSocketHandler({
    db,
    closeOnDetach: true,
    inspect: false,
  })

  // Create a server that uses the handler
  suite.memoryDB = createServer(async (socket: Socket) => {
    try {
      await handler.attach(socket)
      console.log('Client connected')
    } catch (err) {
      console.error('Error attaching socket', err)
      socket.end()
    }
  })

  // Use dynamic port allocation to avoid conflicts
  const server = suite.memoryDB
  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as any)?.port
      if (port) {
        process.env.DATABASE_URI = `postgres://postgres:postgres@127.0.0.1:${port}/test-suite-payload-better-auth-${Date.now()}`
        // console.log('process.env.DATABASE_URI =====> ', process.env.DATABASE_URI)
        resolve()
      } else {
        reject(new Error('Failed to get server port'))
      }
    })
    server.on('error', reject)
  })
  process.on('exit', () => {
    server.close()
  })
  // console.log('Memory database server started')
  // console.log('Memory database uri: ', process.env.DATABASE_URI)

  // Force database to be in memory and don't use the local one for test
  // console.log('Starting memory database')
  // suite.memoryDB = await MongoMemoryReplSet.create({
  //   replSet: {
  //     count: 1,
  //     dbName: 'payloadmemory',
  //     storageEngine: 'wiredTiger',
  //   },
  // })
  // await suite.memoryDB.waitUntilRunning()
  // console.log('Memory database started')

  // process.env.DATABASE_URI = `${suite.memoryDB.getUri()}&retryWrites=true`

  // IMPORTANT: payload.config should be always imported dynamically since it uses the process.env.DATABASE_URI
  // and we want it to use our replaced uri for tests with in memory mongodb.

  const payloadConfig = await config
  suite.payload = await getPayload({ config: payloadConfig })
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
