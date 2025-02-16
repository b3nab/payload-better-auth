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

import {
  accountCollection,
  generatePayloadCollections,
  sessionCollection,
  userCollection,
  verificationCollection,
} from './core-schema/index.js'
import { EndpointFactory } from './factory.endpoint.js'
import { createAuthStrategies } from './factory.strategy.js'
import { betterAuthSingleton } from './singleton.better-auth.js'
import { getPayload, payloadSingleton } from './singleton.payload.js'
import { payloadAdapter } from './better-auth/payload-adapter.js'
import { getAuthTables } from 'better-auth/db'
import { payloadBetterAuthEndpoints } from './endpoints/endpoints.payload-better-auth.js'
// import { createAuthClient } from 'better-auth/react'
import { pluginsToLoad } from './better-auth/plugins.server.js'
import { nextCookies } from 'better-auth/next-js'

export type BetterAuthPluginOptions = {
  /**
   * Disable the plugin but keep added collections/fields to mantain database consistency
   */
  disabled?: boolean
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>
  collectionUser?: string
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   */
  betterAuth?: Omit<BetterAuthOptions, 'database'>
  betterAuthPlugins?: {
    /**
     * List of plugins to add to better-auth
     */
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
    [key: string]: () => BetterAuthPlugin
  }
}

// Plugin PayloadCMS che utilizza l'adapter
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
    // const authClient = createAuthClient(betterAuthOptions)
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

    if (pluginOptions.disabled) {
      /**
       * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
       * If your plugin heavily modifies the database schema, you may want to remove this property.
       */
      return config
    }

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
    ///////////////////////////////////////////

    if (!config.admin) {
      config.admin = {}
    }

    config.admin.routes = {
      ...config.admin.routes,
      // account: '/auth/account'
      // createFirstUser: '/auth/create-first-user',
      // forgot: '/auth/forgot'
      // inactivity: '/auth/inactivity'
      // login: '/auth/login'
      // logout: '/auth/logout'
      // reset: '/auth/reset'
      // unauthorized: '/auth/unauthorized'
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    config.admin.components = {
      ...config.admin.components,
      // beforeLogin: [
      //   // `payload-better-auth/client#BeforeLoginClient`,
      //   `payload-better-auth/rsc#BeforeLoginServer`,
      // ],

      // Better Auth Custom Views
      views: {
        // account: {
        //   path: '/auth/account',
        //   Component: 'payload-better-auth/rsc#AccountServer',
        // },
        // login: {
        //   path: '/auth/login',
        //   Component: 'payload-better-auth/rsc#LoginServer',
        // },
        // createFirstUser: {
        //   path: '/auth/create-first-user',
        //   Component: 'payload-better-auth/rsc#CreateFirstUserServer',
        // },
        // forgot: {
        //   path: '/auth/forgot',
        //   Component: 'payload-better-auth/rsc#ForgotServer',
        // },
        // inactivity: {
        //   path: '/auth/inactivity',
        //   Component: 'payload-better-auth/rsc#InactivityServer',
        // },
        // login: {
        //   path: '/auth/login',
        //   Component: 'payload-better-auth/rsc#LoginServer',
        // },
        // logout: {
        //   path: '/auth/logout',
        //   Component: 'payload-better-auth/rsc#LogoutServer',
        // },
        // reset: {
        //   path: '/auth/reset',
        //   Component: 'payload-better-auth/rsc#ResetServer',
        // },
        // unauthorized: {
        //   path: '/auth/unauthorized',
        //   Component: 'payload-better-auth/rsc#UnauthorizedServer',
        // },
      },
    }

    // if (!config.admin.components.beforeDashboard) {
    //   config.admin.components.beforeDashboard = []
    // }

    // config.admin.components.beforeDashboard.push(
    //   `payload-better-auth/client#BeforeDashboardClient`,
    // )
    // config.admin.components.beforeDashboard.push(
    //   `payload-better-auth/rsc#BeforeDashboardServer`,
    // )

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
