import type { Payload } from 'payload'
import type { BetterAuthPluginOptions } from './index'
import { payloadSingleton } from './singleton.payload'
import type { InferBetterAuthInstance } from './better-auth/instance'

let betterAuthInstance: any | undefined

// Create a type-safe setter that preserves type information
export const betterAuthSingleton = <O extends BetterAuthPluginOptions>(
  instance: InferBetterAuthInstance<O>,
): void => {
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
