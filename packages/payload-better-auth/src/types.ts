import type { CollectionConfig, CollectionSlug } from 'payload'
import type { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
// biome-ignore lint/style/useImportType: <explanation>
import {
  // // core authentication
  twoFactor,
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  // passkey,
  genericOAuth,
  oneTap,
  // // core authorization
  admin,
  organization,
  // // core enterprise
  oidcProvider,
  // // core utility
  bearer,
  multiSession,
  oAuthProxy,
  openAPI,
  jwt,
} from 'better-auth/plugins'
// biome-ignore lint/style/useImportType: <explanation>
import { sso } from 'better-auth/plugins/sso'
// biome-ignore lint/style/useImportType: <explanation>
import { passkey } from 'better-auth/plugins/passkey'
// biome-ignore lint/style/useImportType: <explanation>
import { emailHarmony } from 'better-auth-harmony'
// biome-ignore lint/style/useImportType: <explanation>
import { stripe } from '@better-auth/stripe'
// biome-ignore lint/style/useImportType: <explanation>
import { polar } from '@polar-sh/better-auth'
// biome-ignore lint/style/useImportType: <explanation>
import { Polar } from '@polar-sh/sdk'
// biome-ignore lint/style/useImportType: <explanation>
import Stripe from 'stripe'
import type { LoggerConfig } from './singleton.logger.js'

export type CollectionConfigExtend<T extends CollectionSlug> = Omit<
  CollectionConfig<T>,
  'slug'
>

export type BetterAuthPluginOptions = Readonly<{
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   * This config will override the default ones from the plugin itself.
   */
  betterAuth?: Omit<BetterAuthOptions, 'database' | 'plugins'>
  /**
   * Better Auth Plugins Config. https://www.better-auth.com/docs/concepts/plugins
   * This config will override the default ones from the plugin itself.
   * @default {
   *  twoFactor: true,
   *  openAPI: true,
   *  admin: true,
   */
  betterAuthPlugins?: {
    // core authentication
    twoFactor?: Parameters<typeof twoFactor>[0]
    username?: boolean | Parameters<typeof username>[0]
    anonymous?: boolean | Parameters<typeof anonymous>[0]
    phoneNumber?: boolean | Parameters<typeof phoneNumber>[0]
    magicLink?: boolean | Parameters<typeof magicLink>[0]
    emailOTP?: boolean | Parameters<typeof emailOTP>[0]
    passkey?: boolean | Parameters<typeof passkey>[0]
    genericOAuth?: boolean | Parameters<typeof genericOAuth>[0]
    oneTap?: boolean | Parameters<typeof oneTap>[0]
    // core authorization
    admin?: Parameters<typeof admin>[0]
    organization?: boolean | Parameters<typeof organization>[0]
    // core enterprise
    oidcProvider?: boolean | Parameters<typeof oidcProvider>[0]
    sso?: boolean | Parameters<typeof sso>[0]
    // core utility
    bearer?: boolean | Parameters<typeof bearer>[0]
    multiSession?: boolean | Parameters<typeof multiSession>[0]
    oAuthProxy?: boolean | Parameters<typeof oAuthProxy>[0]
    openAPI?: Parameters<typeof openAPI>[0]
    jwt?: boolean | Parameters<typeof jwt>[0]
    // payments
    stripe?:
      | boolean
      | (Omit<Parameters<typeof stripe>[0], 'stripeClient'> & {
          clientConfig?: ConstructorParameters<typeof Stripe>[0]
        })
    polar?:
      | boolean
      | (Omit<Parameters<typeof polar>[0], 'client'> & {
          clientConfig?: ConstructorParameters<typeof Polar>[0]
        })
    // third-party
    emailHarmony?: boolean | Parameters<typeof emailHarmony>[0]
    // validator?: boolean | Parameters<typeof validator>
  }
  // & {
  //   [key: string]: (() => BetterAuthPlugin) | boolean
  // }

  /**
   * Extends collections from better-auth
   *
   */
  extendsCollections?: {
    [K in CollectionSlug]?: CollectionConfigExtend<K>
  }
  /**
   * Set the log level for the plugin.
   * @default 'info'
   */
  logs?: false | LoggerConfig['level'] // 'debug' | 'info' | 'warn' | 'error'
}>
