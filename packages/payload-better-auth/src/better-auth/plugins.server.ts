import type { BetterAuthPlugin } from "better-auth"
import {
  // // core authentication
  twoFactor,
  // // core authorization
  admin,
  openAPI,
} from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
// biome-ignore lint/style/useImportType: <explanation>
import type { BetterAuthPluginOptions } from '../types.js'
import { ac, roles } from './permissions.js'


export type PluginsToLoad<O extends BetterAuthPluginOptions> = Array<
  // | ReturnType<typeof pluginsToLoad<O>>[number]
  //
  | DefaultPlugins<O>
  //
  | (O['betterAuth'] extends { plugins: infer BAPlugins }
      ? BAPlugins extends BetterAuthPlugin[]
        ? BAPlugins[number]
        : never
      : never)
  //
  // | (O['betterAuth'] extends { plugins: infer BAPlugins }
  //     ? BAPlugins extends never[]
  //       ? DefaultPlugins<O>
  //       : BAPlugins
  //     : DefaultPlugins<O>)
>


// type UserPlugins<O extends BetterAuthPluginOptions> = ReturnType<
//   typeof userPlugins<O['betterAuthPlugins']>
// >[number]
type DefaultPlugins<O extends BetterAuthPluginOptions> = ReturnType<
  typeof defaultPluginsNew<O['betterAuth']>
>[number]

export const defaultPluginsNew = <
  BAP extends BetterAuthPluginOptions['betterAuth'],
>(
  inputConfig: NonNullable<BAP>['plugins'],
) => {
  const ids = {
    admin: {
      key: 'admin',
      plugin: admin({ ac, roles }),
    },
    'next-cookies': {
      key: 'nextCookies',
      plugin: nextCookies(),
    },
    'open-api': {
      key: 'openAPI',
      plugin: openAPI(),
    },
    'two-factor': {
      key: 'twoFactor',
      plugin: twoFactor({
        // otpOptions: {
        //   sendOTP(data, request) {
        //       // TODO: implement send email for OTP
        //   },
        // }
      }),
    },
  }

  const pluginsDefault = Object.values(ids).map((id) => id.plugin)

  const configuredPluginKeys = Object.values(inputConfig ?? {}).map((p) => p.id)

  // console.log('configuredPluginKeys: ', configuredPluginKeys)

  const filteredPlugins = pluginsDefault.filter(
    (p) => !configuredPluginKeys.includes(p.id),
  )

  // console.log('filteredPlugins: ', filteredPlugins)

  return !inputConfig ? pluginsDefault : filteredPlugins
}

export const pluginsToLoad = <O extends BetterAuthPluginOptions>(
  pluginOptions: O,
) => [
  // default plugins
  ...defaultPluginsNew(pluginOptions.betterAuth?.plugins ?? []),
  // user plugins
  ...(pluginOptions.betterAuth?.plugins ?? []),
]
