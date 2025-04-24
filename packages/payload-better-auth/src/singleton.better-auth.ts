import type { Payload } from 'payload'
import type { BetterAuthPluginOptions } from './types.js'
import { payloadSingleton } from './singleton.payload.js'
import type {
  BuildBetterAuthOptionsReturnType,
  InferBetterAuthInstance,
} from './better-auth/instance.js'
// biome-ignore lint/style/useImportType: <explanation>
import { betterAuth } from 'better-auth'

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
const defaultOptions = {} as const
type InferInternalBetterAuthInstance = ReturnType<
  typeof betterAuth<BuildBetterAuthOptionsReturnType<typeof defaultOptions>>
>

export const getBetterAuthSafeInternal = (
  payload?: Payload,
): InferInternalBetterAuthInstance =>
  getBetterAuth(payload, true) as InferInternalBetterAuthInstance
