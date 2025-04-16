import type { Payload } from 'payload'
import type { BetterAuthPluginOptions } from './index'
import { payloadSingleton } from './singleton.payload'
import type { InferBetterAuthInstance } from './better-auth/instance'
import type { betterAuth, BetterAuthOptions } from 'better-auth'

// Create a type-safe singleton store with proper type inference
let betterAuthInstance:
  | InferBetterAuthInstance<BetterAuthPluginOptions>
  | undefined

// Create a type-safe setter that preserves type information
export const betterAuthSingleton = <O extends BetterAuthPluginOptions>(
  instance: InferBetterAuthInstance<O>,
): void => {
  betterAuthInstance = instance as unknown as InferBetterAuthInstance<O>
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
  return betterAuthInstance as InferBetterAuthInstance<O>
}

export const getBetterAuthSafe = <O extends BetterAuthPluginOptions>(
  payload?: Payload,
) => getBetterAuth<O>(payload, true)
