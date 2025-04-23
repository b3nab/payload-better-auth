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
// imports
import type { Config } from 'payload'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'

import {
  generatePayloadCollections,
  generatePayloadEndpoints,
} from './core/index.js'
// import { EndpointFactory } from './factory.endpoint.js'
import { createBetterAuthInstance } from './better-auth/instance.js'
import { createAuthStrategies } from './strategies/strategies.payload-better-auth.js'
import { payloadSingleton } from './singleton.payload.js'
import { payloadBetterAuthEndpoints } from './endpoints/endpoints.payload-better-auth.js'
import { initLogger } from './singleton.logger.js'
import type { BetterAuthPluginOptions } from './types.js'

// import { getBetterAuthSafe } from './singleton.better-auth'

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
    // const authApi = getBetterAuthSafe<typeof pluginOptions>()
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

    // const betterAuthEndpoints = new EndpointFactory(
    //   auth,
    //   authEndpoints.api,
    // ).buildEndpoints()
    const betterAuthEndpoints = generatePayloadEndpoints(
      auth,
      authEndpoints.api,
    )

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
