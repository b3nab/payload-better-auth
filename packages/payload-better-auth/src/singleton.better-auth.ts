import type { betterAuth } from 'better-auth'
import type { Payload } from 'payload'
import { payloadSingleton } from './singleton.payload.js'

let betterAuthInstance: ReturnType<typeof betterAuthSingleton> | undefined =
  undefined

export const betterAuthSingleton = <T extends ReturnType<typeof betterAuth>>(
  betterAuthIncoming: T,
) => {
  betterAuthInstance = betterAuthIncoming
  return betterAuthIncoming
}

export const getBetterAuth = (
  payload: Payload | null = null,
  throwError = false,
) => {
  if (payload) payloadSingleton(payload)
  if (throwError && !betterAuthInstance) {
    throw new Error('BetterAuth is not initialized')
  }
  return betterAuthInstance
}
