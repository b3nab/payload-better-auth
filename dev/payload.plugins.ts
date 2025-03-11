import { betterAuthPlugin, type BetterAuthPluginOptions } from '../src/index.js'

export const betterAuthPluginConfig = {
  // betterAuth: {},
  // betterAuthPlugins: {
  //   twoFactor: true,
  // },
  logs: 'trace',
} satisfies BetterAuthPluginOptions

export const plugins = [betterAuthPlugin(betterAuthPluginConfig)]
