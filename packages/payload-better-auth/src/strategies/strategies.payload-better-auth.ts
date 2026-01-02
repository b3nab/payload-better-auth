import type { AuthStrategy } from 'payload'
import type { BetterAuthOptions } from 'better-auth/minimal'
import { betterAuthStrategy } from './better-auth.strategy.js'

interface StrategyFactoryOptions {
  betterAuthOptions: BetterAuthOptions
}

export const createAuthStrategies = (
  options: StrategyFactoryOptions,
): AuthStrategy[] => {
  // Single unified strategy handles all Better Auth auth methods
  // because all methods ultimately result in a Better Auth session
  return [
    {
      name: 'better-auth',
      authenticate: betterAuthStrategy,
    },
  ]
}
