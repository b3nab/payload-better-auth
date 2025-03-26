import {
  betterAuthPlugin,
  type CollectionConfigExtend,
  type BetterAuthPluginOptions,
} from 'payload-better-auth'

const UserExtend: CollectionConfigExtend<'user'> = {
  fields: [
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
  ],
}

export const betterAuthPluginConfig = {
  // betterAuth: {},
  // betterAuthPlugins: {
  //   twoFactor: true,
  // },
  extendsCollections: {
    user: UserExtend,
  },
  logs: 'debug',
} satisfies BetterAuthPluginOptions

export const plugins = [betterAuthPlugin(betterAuthPluginConfig)]
