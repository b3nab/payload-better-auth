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
import type { Config } from 'payload'
import {
  betterAuth,
  type BetterAuthOptions,
  type BetterAuthPlugin,
} from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import { nextCookies } from 'better-auth/next-js'

import { generatePayloadCollections } from './core/index.js'
import { EndpointFactory } from './factory.endpoint.js'
import { createAuthStrategies } from './strategies/strategies.payload-better-auth.js'
import { betterAuthSingleton } from './singleton.better-auth.js'
import { getPayload, payloadSingleton } from './singleton.payload.js'
import { payloadBetterAuthEndpoints } from './endpoints/endpoints.payload-better-auth.js'
import { generateBetterAuthOptions } from './better-auth/generate-options.js'
import { initLogger, type LoggerConfig } from './logger.js'
import { openAPI, twoFactor } from 'better-auth/plugins'
import { payloadAdapter } from './better-auth/payload-adapter.js'

export type BetterAuthPluginOptions = {
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   * This config will override the default ones from the plugin itself.
   */
  betterAuth?: Omit<BetterAuthOptions, 'database'>
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
    twoFactor?: boolean
    username?: boolean
    anonymous?: boolean
    phoneNumber?: boolean
    magicLink?: boolean
    emailOTP?: boolean
    passkey?: boolean
    genericOAuth?: boolean
    oneTap?: boolean
    // core authorization
    admin?: boolean
    organization?: boolean
    // core enterprise
    oidcProvider?: boolean
    sso?: boolean
    // core utility
    bearer?: boolean
    multiSession?: boolean
    oAuthProxy?: boolean
    openAPI?: boolean
    jwt?: boolean
    // third-party
    harmony?: boolean
    validator?: boolean
  } & {
    [key: string]: (() => BetterAuthPlugin) | boolean
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

    const betterAuthOptions = generateBetterAuthOptions(pluginOptions)
    // extract api endpoints the same way as better-auth do.
    const auth = betterAuth(betterAuthOptions)
    // const auth = betterAuth({
    //   database: payloadAdapter({
    //     payload: getPayload(),
    //   }),
    //   emailAndPassword: {
    //     enabled: true,
    //   },
    //   plugins: [twoFactor(), openAPI()],
    // })
    // auth.api.verifyTOTP({
    //   body: {
    //     code: '',
    //   },
    // })
    betterAuthSingleton<typeof auth>(auth)

    // console.log('keys:', Object.keys(auth.api))
    // console.log(`[better-auth] auth.api: ${JSON.stringify(auth.api, null, 2)}`)
    const authEndpoints = getEndpoints(auth.$context, betterAuthOptions)
    const authTables = getAuthTables(betterAuthOptions)

    // console.log('authTables', Object.keys(authTables))
    // console.log('authTables', JSON.stringify(authTables, null, 2))

    // console.log('keys authEndpoints:', Object.keys(authEndpoints.api))
    // console.log(
    //   `[better-auth] authEndpoints.api: ${JSON.stringify(authEndpoints.api, null, 2)}`,
    // )

    ///////////////////////////////////
    // Add Better Auth - Core Schema
    ///////////////////////////////////
    const betterAuthCollections = generatePayloadCollections(authTables)
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
      betterAuthOptions,
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

    // console.log(
    //   `[plugin-better-auth] endpoints api: ${Object.keys(betterAuthEndpoints)}`,
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
          betterAuthOptions.plugins?.some(
            (plugin) => plugin.id === 'two-factor',
          ),
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
