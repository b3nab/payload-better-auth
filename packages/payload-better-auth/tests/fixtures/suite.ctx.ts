import type { Payload } from 'payload'
import type { MongoMemoryReplSet } from 'mongodb-memory-server'
import type {Server} from 'net'
import { betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import type { BetterAuthDbSchema } from 'better-auth/db'
import type { NextRESTClient } from '../../dev/helpers/NextRESTClient'

export type Suite = {
  memoryDB: Server
  payload: Payload
  restClient: NextRESTClient
  betterAuth: ReturnType<typeof betterAuth>
  betterAuthEndpoints: ReturnType<typeof getEndpoints>
  betterAuthTables: BetterAuthDbSchema
  // betterAuthOptions: BetterAuthOptions
  // betterAuthPlugins: BetterAuthPlugin[]
}

let suite: Suite | undefined

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

export const clearSuite = () => {
  // console.log('\n\n============================\nClearing suite\n============================\n\n')
  // console.log('process.env.DATABASE_URI =====> ', process.env.DATABASE_URI)
  suite = undefined
}
