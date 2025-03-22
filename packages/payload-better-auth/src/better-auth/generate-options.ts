import type { BetterAuthOptions } from 'better-auth'
import { payloadAdapter } from './payload-adapter.js'
import { getPayload } from '../singleton.payload.js'
import { pluginsToLoad } from './plugins.server.js'
import { nextCookies } from 'better-auth/next-js'
import type { BetterAuthPluginOptions } from '../index.js'

export const generateBetterAuthOptions = (
  pluginOptions: BetterAuthPluginOptions,
) => {
  const plugins = [...pluginsToLoad(pluginOptions), nextCookies()]
  const options = {
    // defaults (sane defaults)
    //////////////////////////////
    database: payloadAdapter({
      payload: getPayload(),
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
    trustedOrigins: [
      process.env.NEXT_PUBLIC_SERVER_URL,
      ...(pluginOptions.betterAuth?.trustedOrigins || []),
    ],
    // user: {
    //   additionalFields: {
    //     name: {
    //       type: 'string',
    //     },
    //   },
    // },
  }

  return options
}
