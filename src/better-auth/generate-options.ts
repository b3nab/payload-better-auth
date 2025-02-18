import type { BetterAuthOptions } from 'better-auth'
import { payloadAdapter } from './payload-adapter.js'
import { getPayload } from '../singleton.payload.js'
import { pluginsToLoad } from './plugins.server.js'
import { nextCookies } from 'better-auth/next-js'
import type { BetterAuthPluginOptions } from '../index.js'

export const generateBetterAuthOptions = (
  pluginOptions: BetterAuthPluginOptions,
): BetterAuthOptions => {
  return {
    // defaults (sane defaults)
    //////////////////////////////
    database: payloadAdapter({
      payload: getPayload(),
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [...pluginsToLoad(pluginOptions), nextCookies()],

    // options from plugin
    ////////////////////////////
    ...(pluginOptions.betterAuth || {}),

    // merge options (nested ones)
    //////////////////////////////////
    trustedOrigins: [
      // url for hoppscotch extension proxy
      'chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld',
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
}
