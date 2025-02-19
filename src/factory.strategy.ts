import type { AuthStrategy, AuthStrategyFunction, User } from 'payload'
import type { betterAuth, BetterAuthOptions } from 'better-auth'
import { getBetterAuth } from './singleton.better-auth.js'
import { payloadSingleton } from './singleton.payload.js'

// async ({ req, res }) => {
//   try {
//     const response = await betterAuthInstance.api.signInEmail({
//       req: req as Request,
//       email: req.body.email,
//       password: req.body.password,
//     })

//     if (!response.user) {
//       return null
//     }

//     return {
//       user: response.user,
//     }
//   } catch (error) {
//     return null
//   }
// },
const emailAndPasswordStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  console.log('emailAndPasswordStrategy', headers)
  return {
    user: null,
  }
}

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

const betterAuthStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName = 'better-auth',
}) => {
  payloadSingleton(payload)
  console.log('betterAuthStrategy')
  // console.log('betterAuthStrategy', headers)
  const betterAuth = getBetterAuth()
  const result = await betterAuth?.api.getSession({
    headers: headers,
  })
  console.log('betterAuthStrategy result', result)

  const user = result?.user
    ? {
        ...result.user,
        collection: payload.config.admin.user,
        id: result.user.id,
        email: result.user.email,
        // username: result.user.username,
      }
    : null

  return {
    user: user ?? null,
  }
}

const defaultStrategies: Record<string, AuthStrategyFunction> = {
  // better-auth example
  betterAuth: betterAuthStrategy,
  // built-in
  emailAndPassword: emailAndPasswordStrategy,
  social: socialStrategy,
  // plugins
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

  return [
    {
      name: 'better-auth',
      authenticate: defaultStrategies.betterAuth,
    },
    // Email & Password Strategy
    {
      name: 'email-password',
      authenticate: defaultStrategies.emailAndPassword,
    },

    // TOTP Strategy (2FA)
    // {
    //   name: 'totp',
    //   authenticate: async ({ req, res }) => {
    //     try {
    //       const response = await betterAuthInstance.api.verifyTOTP({
    //         req: req as Request,
    //         code: req.body.code,
    //       })

    //       if (!response.user) {
    //         return null
    //       }

    //       return {
    //         user: response.user,
    //       }
    //     } catch (error) {
    //       return null
    //     }
    //   },
    // },

    // // Passkey Strategy
    // {
    //   name: 'passkey',
    //   authenticate: async ({ req, res }) => {
    //     try {
    //       const response = await betterAuthInstance.api.verifyPasskey({
    //         req: req as Request,
    //         credential: req.body.credential,
    //       })

    //       if (!response.user) {
    //         return null
    //       }

    //       return {
    //         user: response.user,
    //       }
    //     } catch (error) {
    //       return null
    //     }
    //   },
    // },
  ]
}
