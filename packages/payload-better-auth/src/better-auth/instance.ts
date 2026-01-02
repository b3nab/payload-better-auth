import type { BetterAuthPluginOptions } from '../types.js'
import { type PluginsToLoad, pluginsToLoad } from './plugins.server.js'
import type { Payload } from 'payload'
import type { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
import type { DBAdapter } from '@better-auth/core/db/adapter'
import { betterAuth } from 'better-auth/minimal'
import { payloadAdapter } from './payload-adapter.js'
import { getPayload } from '../singleton.payload.js'
import { betterAuthSingleton } from '../singleton.better-auth.js'
import { getLogger } from '../singleton.logger.js'

// The type for the Better Auth instance with proper plugin inference
export type InferBetterAuthInstance<O extends BetterAuthPluginOptions> =
  // & ImprovedAuth<O>
  // ReturnType<typeof betterAuth<ReturnType<typeof buildBetterAuthOptions<O>>>> & {
  ReturnType<typeof betterAuth<BuildOptions<O>>>
// @ts-ignore
// ReturnType<typeof betterAuth<BuildBetterAuthOptionsReturnType<O>>>
// & {
//   // Add a type assertion to help TypeScript understand that the api object can contain any plugin's API methods
//   // HACK: this is a hack to make the api object contain any plugin's API methods and allow the code to compile.
//   // But for some issues on some plugins, those api endpoints are not correctly inferred.
//   // The issues are only on some plugins, not all.
//   // Like the stripe plugin: the `stripeWebhook`method is correctly inferred, but the `cancelSubscription` and all other methods are not.
//   // And the admin plugin: the `banUser` method is not correctly inferred (banUser is an example, all the other methods are not correctly inferred as well).
//   api: Record<string, any>
// }

const defaultOptions = {} as const
export type InferInternalBetterAuthInstance = ReturnType<
  typeof betterAuth<BuildBetterAuthOptionsReturnType<typeof defaultOptions>>
>

export type InferPlugins<O extends BetterAuthPluginOptions> =
  InferBetterAuthInstance<O>['options']['plugins'][number]

// The following error is due to the fact that the types of better-auth are not well designed.
// The types should be improved to allow for a more type-safe usage of the library.
// DO NOT TYPE THE RETURN TYPE OF THIS FUNCTION BECAUSE IT WILL BREAK THE TYPE INFERENCE OF THE PLUGIN.
export const createBetterAuthInstance = <
  const O extends BetterAuthPluginOptions,
>({
  pluginOptions,
  payload,
}: {
  pluginOptions: O
  payload?: Payload
}): InferBetterAuthInstance<O> => {
  const betterAuthOptions = buildBetterAuthOptions(pluginOptions, payload)

  // Create Better Auth instance
  const instance = betterAuth(betterAuthOptions)

  // Store instance in singleton
  betterAuthSingleton(instance)

  return instance
}

type SafePlugins<T extends any[]> = T extends BetterAuthPlugin ? T[] : never

// Type to ensure all plugins in an array are BetterAuthPlugin instances
type EnsureBetterAuthPlugins<T extends any[]> = T extends (infer U)[]
  ? U extends BetterAuthPlugin
    ? T
    : never
  : never

// export type BuildOptions<O extends BetterAuthPluginOptions> = ReturnType<typeof buildBetterAuthOptions<O>>
export type BuildOptions<O extends BetterAuthPluginOptions> =
  BuildBetterAuthOptionsReturnType<O>

export type BuildBetterAuthOptionsReturnType<
  O extends BetterAuthPluginOptions,
> = O['betterAuth'] & {
  database: (options: BetterAuthOptions) => DBAdapter
  emailAndPassword: {
    enabled: boolean
  }
  // plugins: BetterAuthPlugin[]
  plugins: PluginsToLoad<O>
  // plugins: EnsureBetterAuthPlugins<PluginsToLoad<O>>
  // plugins: SafePlugins<PluginsToLoad<O>>
  // plugins: any
  // EnsureBetterAuthPlugins<EnabledPluginsArray<O>>
  trustedOrigins: BetterAuthOptions['trustedOrigins']
}

// export type BuildBetterAuthOptionsReturnType<
//   O extends BetterAuthPluginOptions,
// > = ReturnType<typeof buildBetterAuthOptions<O>>

const buildBetterAuthOptions = <const O extends BetterAuthPluginOptions>(
  pluginOptions: O,
  payload?: Payload,
): BuildBetterAuthOptionsReturnType<O> => {
  const logger = getLogger()
  // Load plugins based on configuration
  // const plugins = pluginsToLoad(pluginOptions)

  // Handle trusted origins
  // leave this way.. typescript types are shit..
  let trustedOrigins: BetterAuthOptions['trustedOrigins'] = []
  if (pluginOptions.betterAuth?.trustedOrigins) {
    const trusted = pluginOptions.betterAuth.trustedOrigins
    if (Array.isArray(trusted)) {
      trustedOrigins = [process.env.NEXT_PUBLIC_SERVER_URL ?? '', ...trusted]
    } else {
      trustedOrigins = async (request) => [
        process.env.NEXT_PUBLIC_SERVER_URL ?? '',
        ...(await trusted(request)),
      ]
    }
  }
  // end cry on typescript types

  const { plugins, ...userOptionsWithoutPlugins } =
    pluginOptions.betterAuth ?? {}

  // Create Better Auth options
  return {
    // options from user config
    ////////////////////////////
    ...(userOptionsWithoutPlugins || {}),

    // overloads
    //////////////////////////////
    database: payloadAdapter({
      payload: payload ?? getPayload(),
      debugLogs: !!pluginOptions.logs
    }),
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true, // sends a verification email on sign‑in if the user isn’t verified
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
        try {
        await payload?.sendEmail({
          to: user.email,
            subject: 'Verify your email address',
            text: `Click the link to verify your email: ${url}`,
          })
        } catch (error) {
          logger.error(error, 'Error sending verification email')
          console.error("email verification url", url)
          console.error("email verification token", token)
        }
      },
      ...(userOptionsWithoutPlugins.emailVerification ?? {}),
    },
    emailAndPassword: {
      sendResetPassword: async ({ user, url, token }, request) => {
        try {
        await payload?.sendEmail({
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        })
        } catch (error) {
          logger.error(error, 'Error sending reset password email')
          console.error("reset password url", url)
          console.error("reset password token", token)
        }
      },
      ...(userOptionsWithoutPlugins.emailAndPassword ?? {}),
      enabled: true,
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async (
          { user, newEmail, url, token },
          request,
        ) => {
          try {
          await payload?.sendEmail({
            to: user.email, // verification email must be sent to the current user email to approve the change
            subject: 'Approve email change',
            text: `Click the link to approve the change: ${url}`,
          })
          } catch (error) {
            logger.error(error, 'Error sending change email verification email')
            console.error("change email verification url", url)
            console.error("change email verification token", token)
          }
        },
        ...(userOptionsWithoutPlugins.user?.changeEmail ?? {}),
      },
      ...(userOptionsWithoutPlugins.user ?? {}),
    },

    plugins: pluginsToLoad(pluginOptions),

    // merge options (nested ones)
    //////////////////////////////////
    trustedOrigins,
  } as BuildBetterAuthOptionsReturnType<O>
}
