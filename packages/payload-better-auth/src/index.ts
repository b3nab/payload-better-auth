/*
 Copyright (C) 2025 Benedetto Abbenanti

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import type { CollectionConfig, CollectionSlug, Config } from 'payload'
import type { BetterAuthOptions, BetterAuthPlugin } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'

import { generatePayloadCollections } from './core/index'
import { EndpointFactory } from './factory.endpoint'
import { createBetterAuthInstance } from './better-auth/instance'
import { createAuthStrategies } from './strategies/strategies.payload-better-auth'
import { payloadSingleton } from './singleton.payload'
import { payloadBetterAuthEndpoints } from './endpoints/endpoints.payload-better-auth'
import { initLogger, type LoggerConfig } from './singleton.logger'

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

export type CollectionConfigExtend<T extends CollectionSlug> = Pick<
  CollectionConfig<T>,
  'fields'
>

export type BetterAuthPluginOptions = {
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
   *  passkey: true,
   *  openAPI: true,
   */
  betterAuthPlugins?: {
    // core authentication
    twoFactor?: boolean | Parameters<typeof twoFactor>[0]
    username?: boolean | Parameters<typeof username>[0]
    anonymous?: boolean | Parameters<typeof anonymous>[0]
    phoneNumber?: boolean | Parameters<typeof phoneNumber>[0]
    magicLink?: boolean | Parameters<typeof magicLink>[0]
    emailOTP?: boolean | Parameters<typeof emailOTP>[0]
    passkey?: boolean | Parameters<typeof passkey>[0]
    genericOAuth?: boolean | Parameters<typeof genericOAuth>[0]
    oneTap?: boolean | Parameters<typeof oneTap>[0]
    // core authorization
    admin?: boolean | Parameters<typeof admin>[0]
    organization?: boolean | Parameters<typeof organization>[0]
    // core enterprise
    oidcProvider?: boolean | Parameters<typeof oidcProvider>[0]
    sso?: boolean | Parameters<typeof sso>[0]
    // core utility
    bearer?: boolean | Parameters<typeof bearer>[0]
    multiSession?: boolean | Parameters<typeof multiSession>[0]
    oAuthProxy?: boolean | Parameters<typeof oAuthProxy>[0]
    openAPI?: boolean | Parameters<typeof openAPI>[0]
    jwt?: boolean | Parameters<typeof jwt>[0]
    // payments
    stripe?: boolean | Omit<Parameters<typeof stripe>[0], 'stripeClient'>
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
}
/**
 * Better Auth Plugin for PayloadCMS
 * @type {BetterAuthPluginOptions} pluginOptions - Options for the plugin
 * @returns - The plugin function for payloadcms
 */
export const betterAuthPlugin =
  (pluginOptions: BetterAuthPluginOptions) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    const logger = initLogger({
      level: pluginOptions.logs || 'info',
    })

    logger.info(`\n- betterAuthPlugin`)

    ///////////////////////////////////
    // Better Auth - INSTANCE
    ///////////////////////////////////

    const auth = createBetterAuthInstance({ pluginOptions })

    // verifyTOTP should be available
    // auth.api.verifyTOTP({
    //   body: {
    //     code: '',
    //   },
    // })

    // retrieve the api instance from the singleton
    // const authApi = getBetterAuth()
    // if (authApi) {
    //   authApi.api.verifyTOTP({
    //     body: {
    //       code: '',
    //     },
    //   })
    // }

    const authEndpoints = getEndpoints(auth.$context, auth.options)
    const authTables = getAuthTables(auth.options)

    logger.trace({ authTables: Object.keys(authTables) }, 'authTables')
    // console.log('authTables', JSON.stringify(authTables, null, 2))

    // console.log('keys authEndpoints:', Object.keys(authEndpoints.api))
    // console.log(
    //   `[better-auth] authEndpoints.api: ${JSON.stringify(authEndpoints.api, null, 2)}`,
    // )

    ///////////////////////////////////
    // Add Better Auth - Core Schema
    ///////////////////////////////////
    const betterAuthCollections = generatePayloadCollections(
      authTables,
      pluginOptions.extendsCollections,
    )
    // Default collections
    config.collections = [
      ...(config.collections || []),
      ...betterAuthCollections,
    ]

    const authCollection = config.collections.find(
      (collection) => collection.auth === true,
    )

    ///////////////////////////////////
    // Add Better Auth - Strategies
    ///////////////////////////////////

    const betterAuthStrategies = createAuthStrategies({
      betterAuthOptions: auth.options,
    })

    if (authCollection) {
      authCollection.auth = {
        // disableLocalStrategy: true,
        strategies: [...betterAuthStrategies],
      }
      authCollection.endpoints = payloadBetterAuthEndpoints
    }
    // config.endpoints = payloadBetterAuthEndpoints

    // console.log('authCollection', authCollection)
    // console.log('authCollection', authCollection?.slug)

    ///////////////////////////////////
    // Add Better Auth - Endpoints
    ///////////////////////////////////

    // if (!config.endpoints) {
    //   config.endpoints = []
    // }

    const betterAuthEndpoints = new EndpointFactory(
      auth,
      authEndpoints.api,
    ).buildEndpoints()

    // logger.trace(
    //   {
    //     endpoints: betterAuthEndpoints.map((endpnt) => endpnt.path),
    //   },
    //   '[plugin-better-auth] endpoints api',
    // )
    // console.log(
    //   `[plugin-better-auth] endpoints api: ${JSON.stringify(betterAuthEndpoints, null, 2)}`,
    // )

    config.endpoints = [...(config.endpoints || []), ...betterAuthEndpoints]

    ///////////////////////////////////////////
    // Add Better Auth - Admin Customization
    ///////////////////////////////////////////
    if (!config.admin) {
      config.admin = {}
    }

    config.admin.components = {
      ...(config.admin.components || {}),
      providers: [
        ...(config.admin.components?.providers || []),
        {
          path: 'payload-better-auth/rsc#BetterAuthServerWrapper',
          serverProps: {
            pluginOptions,
          },
        },
      ],
      views: {
        ...(config.admin.components?.views || {}),
        SetupTwoFactor: {
          path: '/two-factor-setup',
          Component: 'payload-better-auth/rsc#SetupTwoFactorServer',
        },
        VerifyTwoFactor: {
          path: '/two-factor-verify',
          Component: 'payload-better-auth/rsc#VerifyTwoFactorServer',
        },
      },
    }

    // add custom config for auth flows
    config.custom = {
      ...(config.custom || {}),
      authFlows: {
        twoFactor:
          pluginOptions.betterAuthPlugins?.twoFactor ??
          auth.options.plugins?.some((plugin) => plugin.id === 'two-factor'),
      },
    }

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      console.log(`\n- betterAuthPlugin onInit`)
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // attach payload instance to better-auth's payload adapter
      payloadSingleton(payload)
    }

    return config
  }
