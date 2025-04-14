import type { Payload } from 'payload'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { payloadAdapter } from './payload-adapter.js'
import { getPayload } from '../singleton.payload.js'
import { pluginsToLoad } from './plugins.server.js'
import type { BetterAuthPluginOptions } from '../index.js'
import { ac, roles } from './permissions.js'
import { betterAuthSingleton } from '../singleton.better-auth.js'
export type InferBetterAuthInstance<O extends BetterAuthPluginOptions> =
  ReturnType<typeof createBetterAuthInstance<O>>

// The following error is due to the fact that the types of better-auth are not well designed.
// The types should be improved to allow for a more type-safe usage of the library.
// DO NOT TYPE THE RETURN TYPE OF THIS FUNCTION BECAUSE IT WILL BREAK THE TYPE INFERENCE OF THE PLUGIN.
export const createBetterAuthInstance = <O extends BetterAuthPluginOptions>({
  pluginOptions,
  payload,
}: {
  pluginOptions: O
  payload?: Payload
}) => {
  // Load plugins based on configuration
  const plugins = [
    ...pluginsToLoad(pluginOptions),
    admin({ ac, roles }),
    nextCookies(),
  ]

  // Handle trusted origins
  // leave this way.. typescript types are shit..
  let trustedOrigins: BetterAuthOptions['trustedOrigins'] = []
  if (pluginOptions.betterAuth?.trustedOrigins) {
    const trusted = pluginOptions.betterAuth.trustedOrigins
    if (Array.isArray(trusted)) {
      trustedOrigins = [process.env.NEXT_PUBLIC_SERVER_URL ?? '', ...trusted]
    } else {
      trustedOrigins = async (request: Request) => [
        process.env.NEXT_PUBLIC_SERVER_URL ?? '',
        ...(await trusted(request)),
      ]
    }
  }
  // end cry on typescript types

  // Create Better Auth options
  const betterAuthOptions = {
    // defaults (sane defaults)
    //////////////////////////////
    database: payloadAdapter({
      payload: payload ?? getPayload(),
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins,

    // options from plugin
    ////////////////////////////
    ...(pluginOptions.betterAuth || {}),

    // merge options (nested ones)
    //////////////////////////////////
    trustedOrigins,
  } as const

  // Create Better Auth instance
  const instance = betterAuth(betterAuthOptions)

  // Store instance in singleton
  betterAuthSingleton(instance)

  return instance
}
