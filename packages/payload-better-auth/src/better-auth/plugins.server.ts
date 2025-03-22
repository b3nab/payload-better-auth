// import {
// type BetterAuthPlugin,
// // core authentication
// twoFactor,
// username,
// anonymous,
// phoneNumber,
// magicLink,
// emailOTP,
// // passkey,
// genericOAuth,
// oneTap,
// // core authorization
// admin,
// organization,
// // core enterprise
// oidcProvider,
// // sso,
// // core utility
// bearer,
// multiSession,
// oAuthProxy,
// openAPI,
// jwt,
// } from 'better-auth/plugins'
// // core authentication
import { twoFactor } from 'better-auth/plugins/two-factor'
import { username } from 'better-auth/plugins/username'
import { anonymous } from 'better-auth/plugins/anonymous'
import { phoneNumber } from 'better-auth/plugins/phone-number'
import { magicLink } from 'better-auth/plugins/magic-link'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { passkey } from 'better-auth/plugins/passkey'
import { genericOAuth } from 'better-auth/plugins/generic-oauth'
// import {oneTap} from 'better-auth/plugins/one-tap'
// // core authorization
import { admin } from 'better-auth/plugins/admin'
import { organization } from 'better-auth/plugins/organization'
// // core enterprise
import { oidcProvider } from 'better-auth/plugins/oidc-provider'
import { sso } from 'better-auth/plugins/sso'
// // core utility
import { bearer } from 'better-auth/plugins/bearer'
import { multiSession } from 'better-auth/plugins/multi-session'
import { oAuthProxy } from 'better-auth/plugins/oauth-proxy'
// @ts-ignore
import { BetterAuthPlugin, openAPI } from 'better-auth/plugins'
import { jwt } from 'better-auth/plugins/jwt'
import type { BetterAuthPluginOptions } from '../index.js'

import type * as sssoplugintype from 'better-auth/plugins/sso'

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
              // oneTap: oneTap(),
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
        .filter((plugin: BetterAuthPlugin | undefined) => !!plugin)
    : defaultPlugins
