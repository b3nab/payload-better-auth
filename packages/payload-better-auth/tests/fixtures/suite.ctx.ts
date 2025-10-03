import type { Payload } from 'payload'
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import type { BetterAuthDbSchema } from 'better-auth/db'

export type Suite = {
  memoryDB: StartedPostgreSqlContainer
  payload: Payload
  betterAuth: ReturnType<typeof betterAuth>
  betterAuthEndpoints: ReturnType<typeof getEndpoints>
  betterAuthTables: BetterAuthDbSchema
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

export const clearSuite = async () => {
  // console.log('\n\n============================\nClearing suite\n============================\n\n')
  // console.log('process.env.DATABASE_URI =====> ', process.env.DATABASE_URI)
  // await suite?.payload?.destroy()
  // await suite?.memoryDB?.stop()
  suite = undefined
}
