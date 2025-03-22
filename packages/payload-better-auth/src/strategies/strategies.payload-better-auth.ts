import type { AuthStrategy, AuthStrategyFunction, User } from 'payload'
import type { betterAuth, BetterAuthOptions } from 'better-auth'
import { getBetterAuth } from '../singleton.better-auth.js'
import { payloadSingleton } from '../singleton.payload.js'
import { emailAndPasswordStrategy } from './email-and-password.js'
import { twoFactorStrategy } from './two-factor.js'

const socialStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  console.log('socialStrategy', headers)
  return {
    user: null,
  }
}

const defaultStrategies: Record<string, AuthStrategyFunction> = {
  // built-in
  'email-and-password': emailAndPasswordStrategy,
  // social: socialStrategy,
  // plugins
  'two-factor': twoFactorStrategy,
  // totp: totpStrategy,
  // passkey: passkeyStrategy,
}

interface StrategyFactoryOptions {
  betterAuthOptions: BetterAuthOptions
}

// TODO: add strategies
export const createAuthStrategies = (
  options: StrategyFactoryOptions,
): AuthStrategy[] => {
  const { betterAuthOptions } = options

  return Object.entries(defaultStrategies).map(([strategyName, strategy]) => ({
    name: strategyName,
    authenticate: strategy,
  }))
}
