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

import type {
  AuthStrategyFunction,
  CollectionSlug,
  Config,
  Endpoint,
  PayloadHandler,
} from 'payload'
import {
  betterAuth,
  type BetterAuthOptions,
  type BetterAuthPlugin,
} from 'better-auth'
import { getEndpoints } from 'better-auth/api'

import { generatePayloadCollections } from './core-schema/index.js'
import { EndpointFactory } from './factory.endpoint.js'
import { createAuthStrategies } from './factory.strategy.js'
import { betterAuthSingleton } from './singleton.better-auth.js'
import { getPayload, payloadSingleton } from './singleton.payload.js'
import { payloadAdapter } from './better-auth/payload-adapter.js'
import { getAuthTables } from 'better-auth/db'
import { payloadBetterAuthEndpoints } from './endpoints/endpoints.payload-better-auth.js'
import { pluginsToLoad } from './better-auth/plugins.server.js'
import { nextCookies } from 'better-auth/next-js'

export type BetterAuthPluginOptions = {
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   * This config will override the default ones from the plugin itself.
   */
  betterAuth?: Omit<BetterAuthOptions, 'database'>
  /**
   * Better Auth Plugins Config. https://www.better-auth.com/docs/concepts/plugins
   * This config will override the default ones from the plugin itself.
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

    // console.log(`\n- betterAuthPlugin`)

    ///////////////////////////////////
    // Better Auth - INSTANCE
    ///////////////////////////////////

    const betterAuthOptions: BetterAuthOptions = {
      //////////////////////////////
      // defaults (sane defaults)
      //////////////////////////////
      database: payloadAdapter({
        payload: getPayload(),
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [...pluginsToLoad(pluginOptions), nextCookies()],

      ////////////////////////////
      // options from plugin
      ////////////////////////////
      ...(pluginOptions.betterAuth || {}),

      //////////////////////////////////
      // merge options (nested ones)
      //////////////////////////////////
      trustedOrigins: [
        // url for hoppscotch extension proxy
        'chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld',
        ...(pluginOptions.betterAuth?.trustedOrigins || []),
      ],
      // user: {
      //   additionalFields: {
      //     name: {
      //       type: 'string',
      //     },
      //   },
      // },
    }
    // extract api endpoints the same way as better-auth do.
    const auth = betterAuth(betterAuthOptions)
    betterAuthSingleton(auth)
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
    // TODO: add core schema dynamically from authTables
    const betterAuthCollections = generatePayloadCollections(authTables)
    // Default collections
    config.collections = [
      ...(config.collections || []),
      ...betterAuthCollections,
    ]

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

    ///////////////////////////////////
    // Add Better Auth - Strategies
    ///////////////////////////////////

    const betterAuthStrategies = createAuthStrategies({
      betterAuthOptions,
    })

    const authCollection = config.collections.find(
      (collection) => collection.auth === true,
    )

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

    ///////////////////////////////////////////
    // Add Better Auth - Admin Customization
    // TODO: add admin customization - planned? what?
    ///////////////////////////////////////////
    // if (!config.admin) {
    //   config.admin = {}
    // }

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
