import type { betterAuth } from 'better-auth'

let betterAuthInstance: ReturnType<typeof betterAuth> | undefined = undefined

export const betterAuthSingleton = (
  betterAuthIncoming: ReturnType<typeof betterAuth>,
) => {
  betterAuthInstance = betterAuthIncoming
}

export const getBetterAuth = (throwError = false) => {
  if (throwError && !betterAuthInstance) {
    throw new Error('BetterAuth is not initialized')
  }
  return betterAuthInstance
}
