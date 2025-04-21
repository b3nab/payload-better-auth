import type { Payload } from 'payload'
import { betterAuth } from 'better-auth'
import type { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
import { payloadAdapter } from './payload-adapter'
import { getPayload } from '../singleton.payload'
import {
  type EnabledPluginsArray,
  type PluginsToLoad,
  pluginsToLoad,
} from './plugins.server'
import { betterAuthSingleton } from '../singleton.better-auth'
import type { BetterAuthPluginOptions } from '../index'

// Helper type to ensure plugins are compatible with BetterAuthPlugin
type EnsureBetterAuthPlugins<T> = T extends BetterAuthPlugin[] ? T : never

// The type for the Better Auth instance with proper plugin inference
export type InferBetterAuthInstance<O extends BetterAuthPluginOptions> =
  // & ImprovedAuth<O>
  // ReturnType<typeof betterAuth<ReturnType<typeof buildBetterAuthOptions<O>>>> & {
  ReturnType<typeof betterAuth<BuildBetterAuthOptionsReturnType<O>>> & {
    // Add a type assertion to help TypeScript understand that the api object can contain any plugin's API methods
    // HACK: this is a hack to make the api object contain any plugin's API methods and allow the code to compile.
    // But for some issues on some plugins, those api endpoints are not correctly inferred.
    // The issues are only on some plugins, not all.
    // Like the stripe plugin: the `stripeWebhook`method is correctly inferred, but the `cancelSubscription` and all other methods are not.
    // And the admin plugin: the `banUser` method is not correctly inferred (banUser is an example, all the other methods are not correctly inferred as well).
    // api: Record<string, any>
  }

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

export type BuildBetterAuthOptionsReturnType<
  O extends BetterAuthPluginOptions,
> = {
  database: ReturnType<typeof payloadAdapter>
  emailAndPassword: {
    enabled: boolean
  }
  plugins: EnsureBetterAuthPlugins<EnabledPluginsArray<O>>
  trustedOrigins: BetterAuthOptions['trustedOrigins']
} & O['betterAuth']
// type BuildBetterAuthOptionsReturnType<O extends BetterAuthPluginOptions> =
//   ReturnType<typeof buildBetterAuthOptions<O>>

const buildBetterAuthOptions = <const O extends BetterAuthPluginOptions>(
  pluginOptions: O,
  payload?: Payload,
): BuildBetterAuthOptionsReturnType<O> => {
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
      trustedOrigins = async (request: Request) => [
        process.env.NEXT_PUBLIC_SERVER_URL ?? '',
        ...(await trusted(request)),
      ]
    }
  }
  // end cry on typescript types

  // Create Better Auth options
  return {
    // defaults (sane defaults)
    //////////////////////////////
    database: payloadAdapter({
      payload: payload ?? getPayload(),
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: pluginsToLoad(pluginOptions),

    // options from plugin
    ////////////////////////////
    ...(pluginOptions.betterAuth || {}),

    // merge options (nested ones)
    //////////////////////////////////
    trustedOrigins,
  } as const as BuildBetterAuthOptionsReturnType<O>
}
