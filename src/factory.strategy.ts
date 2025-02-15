import type { AuthStrategy, AuthStrategyFunction } from 'payload'
import type { betterAuth, BetterAuthOptions } from 'better-auth'

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
  return {
    user: null,
  }
}

const defaultStrategies: Record<string, AuthStrategyFunction> = {
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
