import type { betterAuth } from 'better-auth'

let betterAuthInstance: ReturnType<typeof betterAuthSingleton> | undefined =
  undefined

export const betterAuthSingleton = <T extends ReturnType<typeof betterAuth>>(
  betterAuthIncoming: T,
) => {
  betterAuthInstance = betterAuthIncoming
  return betterAuthIncoming
}

export const getBetterAuth = (throwError = false) => {
  if (throwError && !betterAuthInstance) {
    throw new Error('BetterAuth is not initialized')
  }
  return betterAuthInstance
}
