import type { BetterAuthPlugin } from 'better-auth'
import {
  // // core authentication
  twoFactor,
  // // core authorization
  admin,
  openAPI,
} from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import type { BetterAuthPluginOptions } from '../types.js'
import { ac, roles } from './permissions.js'

// rest-parameter capture: the compiler-checked way to build a tuple type
const tuple = <T extends BetterAuthPlugin[]>(...plugins: T) => plugins

// better-auth infers plugin schema fields (e.g. the admin plugin's user.role)
// only from tuple types: InferDBFieldsFromPlugins iterates
// [infer P, ...infer Rest] and a plain Array<union> resolves to {}.
const buildDefaultPlugins = () =>
  tuple(
    admin({ ac, roles }),
    openAPI({
      disableDefaultReference: process.env.NODE_ENV === 'production',
    }),
    twoFactor({
      // otpOptions: {
      //   sendOTP(data, request) {
      //       // TODO: implement send email for OTP
      //   },
      // }
    }),
  )

// nextCookies must be the LAST plugin of the array (better-auth docs): its
// response hook turns set-cookie headers into Next cookies and has to run
// after every other plugin, the host ones included
const buildTailPlugins = () => tuple(nextCookies())

export type DefaultPlugins = ReturnType<typeof buildDefaultPlugins>
export type TailPlugins = ReturnType<typeof buildTailPlugins>

// resolved at instantiation: the host tuple when present, [] when absent,
// an open array when the host type is widened (graceful head-only inference)
export type UserPlugins<O extends BetterAuthPluginOptions> = NonNullable<
  O['betterAuth']
>['plugins'] extends infer PP
  ? PP extends readonly [...infer P extends BetterAuthPlugin[]]
    ? P
    : []
  : []

export type PluginsToLoad<O extends BetterAuthPluginOptions> = [
  ...DefaultPlugins,
  ...UserPlugins<O>,
  ...TailPlugins,
]

// runtime mirror of PluginsToLoad: a consumer plugin with the same id
// replaces the default at runtime; the declared tuple keeps both, and
// their inferred fields are identical anyway
export const pluginsToLoad = <O extends BetterAuthPluginOptions>(
  pluginOptions: O,
) => {
  const userPlugins = pluginOptions.betterAuth?.plugins ?? []
  const userPluginIds = userPlugins.map((plugin) => plugin.id)
  const defaultPlugins = buildDefaultPlugins().filter(
    (plugin) => !userPluginIds.includes(plugin.id),
  )
  const tailPlugins = buildTailPlugins().filter(
    (plugin) => !userPluginIds.includes(plugin.id),
  )
  return [...defaultPlugins, ...userPlugins, ...tailPlugins]
}
