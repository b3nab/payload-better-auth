import {
  type BetterAuthPlugin,
  // core authentication
  twoFactor,
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  // passkey,
  genericOAuth,
  oneTap,
  // core authorization
  admin,
  organization,
  // core enterprise
  oidcProvider,
  // sso,
  // core utility
  bearer,
  multiSession,
  oAuthProxy,
  openAPI,
  jwt,
} from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import { sso } from 'better-auth/plugins/sso'
import type { BetterAuthPluginOptions } from '../index.js'

export const defaultPlugins = [twoFactor(), passkey(), openAPI()]
export const pluginsToLoad = (pluginOptions: BetterAuthPluginOptions) =>
  pluginOptions.betterAuthPlugins
    ? Object.entries(pluginOptions.betterAuthPlugins)
        .map(([key, plugin]) => {
          if (typeof plugin === 'boolean') {
            return {
              // core authentication
              twoFactor: twoFactor(),
              username: username(),
              anonymous: anonymous(),
              phoneNumber: phoneNumber(),
              // TODO: need to pass options for plugin
              // magicLink: magicLink(),
              // TODO: need to pass options for plugin
              // emailOTP: emailOTP(),
              passkey: passkey(),
              // TODO: need to pass options for plugin
              // genericOAuth: genericOAuth(),
              oneTap: oneTap(),
              // core authorization
              admin: admin(),
              organization: organization(),
              // core enterprise
              // TODO: need to pass options for plugin
              // oidcProvider: oidcProvider(),
              // sso: sso(),
              // core utility
              bearer: bearer(),
              multiSession: multiSession(),
              oAuthProxy: oAuthProxy(),
              openAPI: openAPI(),
              jwt: jwt(),
              // third-party
              // TODO: need to pass options for plugin
              // harmony: harmony(),
              // TODO: need to pass options for plugin
              // validator: validator(),
            }[key]
          }
          return plugin()
        })
        // need to filter out undefined plugins
        .filter((plugin) => !!plugin)
    : defaultPlugins
