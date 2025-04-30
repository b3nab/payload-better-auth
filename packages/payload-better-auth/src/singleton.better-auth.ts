import type { Payload } from 'payload'
import type { BetterAuthPluginOptions } from './types.js'
import { payloadSingleton } from './singleton.payload.js'
import type {
  InferBetterAuthInstance,
  InferInternalBetterAuthInstance,
} from './better-auth/instance.js'

let betterAuthInstance: any | undefined

export const betterAuthSingleton = (instance: any): void => {
  betterAuthInstance = instance
}

// Create a type-safe getter with proper type inference
export const getBetterAuth = <O extends BetterAuthPluginOptions>(
  payload?: Payload,
  throwError = false,
): InferBetterAuthInstance<O> => {
  if (payload) payloadSingleton(payload)
  if (throwError && !betterAuthInstance) {
    throw new Error('BetterAuth is not initialized')
  }
  return betterAuthInstance
}

export const getBetterAuthSafe = <O extends BetterAuthPluginOptions>(
  payload?: Payload,
) => getBetterAuth<O>(payload, true)

// Internal stuffs
// ----------------
export const getBetterAuthSafeInternal = (
  payload?: Payload,
): InferInternalBetterAuthInstance =>
  getBetterAuth(payload, true) as InferInternalBetterAuthInstance
