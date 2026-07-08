import type { Payload } from 'payload'
import type { BetterAuthOptions } from 'better-auth'
import { betterAuth } from 'better-auth/minimal'
import type { BetterAuthPluginOptions } from '../types.js'
import { type PluginsToLoad, pluginsToLoad } from './plugins.server.js'
import { payloadAdapter } from './payload-adapter.js'
import { getLogger } from '../singleton.logger.js'

// The whole better-auth typing is DERIVED from the value returned by
// buildBetterAuthOptions: no hand-written option or instance types.
// better-auth 1.6 infers plugin api endpoints and schema fields reliably
// as long as `plugins` is a tuple (see plugins.server.ts).

export const buildBetterAuthOptions = <const O extends BetterAuthPluginOptions>(
  pluginOptions: O,
  payload: Payload,
) => {
  const logger = getLogger()

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

  const { plugins: _userPlugins, ...userOptionsWithoutPlugins } =
    pluginOptions.betterAuth ?? {}

  return {
    // options from user config
    ////////////////////////////
    ...userOptionsWithoutPlugins,

    // overloads
    //////////////////////////////
    database: payloadAdapter({
      payload,
      debugLogs: !!pluginOptions.logs,
    }),
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true, // sends a verification email on sign‑in if the user isn’t verified
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url, token }, request) => {
        try {
          await payload.sendEmail({
            to: user.email,
            subject: 'Verify your email address',
            text: `Click the link to verify your email: ${url}`,
          })
        } catch (error) {
          logger.error(error, 'Error sending verification email')
          console.error('email verification url', url)
          console.error('email verification token', token)
        }
      },
      ...(userOptionsWithoutPlugins.emailVerification ?? {}),
    },
    emailAndPassword: {
      sendResetPassword: async ({ user, url, token }, request) => {
        try {
          await payload.sendEmail({
            to: user.email,
            subject: 'Reset your password',
            text: `Click the link to reset your password: ${url}`,
          })
        } catch (error) {
          logger.error(error, 'Error sending reset password email')
          console.error('reset password url', url)
          console.error('reset password token', token)
        }
      },
      ...(userOptionsWithoutPlugins.emailAndPassword ?? {}),
      enabled: true,
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async (
          { user, newEmail, url, token },
          request,
        ) => {
          try {
            await payload.sendEmail({
              to: user.email, // verification email must be sent to the current user email to approve the change
              subject: 'Approve email change',
              text: `Click the link to approve the change: ${url}`,
            })
          } catch (error) {
            logger.error(error, 'Error sending change email verification email')
            console.error('change email verification url', url)
            console.error('change email verification token', token)
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
    // compiler-checked (not a cast): validates the object against
    // BetterAuthOptions and gives the callbacks their contextual types,
    // while the narrow inferred type stays untouched
  } satisfies BetterAuthOptions
}

// everything is derived from the buildBetterAuthOptions value, except
// `plugins`: its inferred type is the runtime-widened array, replaced here
// by the hand-written PluginsToLoad tuple (the shape better-auth needs to
// infer plugin schema fields and api endpoints)
export type BuildOptions<O extends BetterAuthPluginOptions> = Omit<
  ReturnType<typeof buildBetterAuthOptions<O>>,
  'plugins'
> & {
  plugins: PluginsToLoad<O>
}

export type InferBetterAuthInstance<O extends BetterAuthPluginOptions> =
  ReturnType<typeof betterAuth<BuildOptions<O>>>

// base instance: default plugins only, no consumer options
export type InferInternalBetterAuthInstance =
  InferBetterAuthInstance<BetterAuthPluginOptions>

export type InferPlugins<O extends BetterAuthPluginOptions> =
  InferBetterAuthInstance<O>['options']['plugins'][number]

export const createBetterAuthInstance = <
  const O extends BetterAuthPluginOptions,
>({
  pluginOptions,
  payload,
}: {
  pluginOptions: O
  payload: Payload
}): InferBetterAuthInstance<O> => {
  const betterAuthOptions = buildBetterAuthOptions(pluginOptions, payload)
  // the single declared frontier of the plugin typing: the runtime merge in
  // pluginsToLoad (defaults filtered by consumer same-id override) cannot be
  // statically verified against the PluginsToLoad tuple. The mirror is kept
  // honest by the inference probes in dev/ and apps/demo (lib/auth.ts).
  return betterAuth(betterAuthOptions as BuildOptions<O>)
}
