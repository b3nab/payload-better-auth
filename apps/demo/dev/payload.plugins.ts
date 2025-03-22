import {
  betterAuthPlugin,
  type BetterAuthPluginOptions,
} from 'payload-better-auth'

export const betterAuthPluginConfig = {
  // betterAuth: {},
  // betterAuthPlugins: {
  //   twoFactor: true,
  // },
  logs: 'trace',
} satisfies BetterAuthPluginOptions

export const plugins = [betterAuthPlugin(betterAuthPluginConfig)]
