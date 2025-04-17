import type { Payload } from 'payload'
import type { MongoMemoryReplSet } from 'mongodb-memory-server'
import type {
  betterAuth,
  BetterAuthOptions,
  BetterAuthPlugin,
} from 'better-auth'
import type { getEndpoints } from 'better-auth/api'
import type { getAuthTables } from 'better-auth/db'
import type { NextRESTClient } from '../../dev/helpers/NextRESTClient'

export type Suite = {
  memoryDB: MongoMemoryReplSet
  payload: Payload
  restClient: NextRESTClient
  betterAuth: ReturnType<typeof betterAuth>
  betterAuthEndpoints: ReturnType<typeof getEndpoints>
  betterAuthTables: ReturnType<typeof getAuthTables>
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
  suite = undefined
}
