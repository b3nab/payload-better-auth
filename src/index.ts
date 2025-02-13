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

import type { CollectionSlug, Config, Endpoint, PayloadHandler } from 'payload'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import { MongoClient } from 'mongodb'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'

import {
  accountCollection,
  sessionCollection,
  userCollection,
  verificationCollection,
} from './core-schema/index.js'
import { EndpointFactory } from './factory.endpoint.js'

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
}

// Plugin PayloadCMS che utilizza l'adapter
export const betterAuthPlugin =
  (pluginOptions: BetterAuthPluginOptions) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    ///////////////////////////////////
    // Add Better Auth - Core Schema
    ///////////////////////////////////

    config.collections = [
      ...(config.collections || []),
      userCollection,
      sessionCollection,
      accountCollection,
      verificationCollection,
    ]

    config.collections.push({
      slug: 'plugin-collection',
      fields: [
        {
          name: 'id',
          type: 'text',
        },
      ],
    })

    if (pluginOptions.collections) {
      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          collection.fields.push({
            name: 'addedByPlugin',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
          })
        }
      }
    }

    if (pluginOptions.disabled) {
      /**
       * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
       * If your plugin heavily modifies the database schema, you may want to remove this property.
       */
      return config
    }
    ///////////////////////////////////
    // Better Auth - INSTANCE
    ///////////////////////////////////
    const betterAuthOptions: BetterAuthOptions = {
      database: mongodbAdapter(
        new MongoClient(
          process.env.DATABASE_URI ||
            'mongodb://127.0.0.1:37001/payload-plugin-better-auth',
        ).db(),
      ),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [twoFactor(), passkey()],
    }
    // extract api endpoints the same way as better-auth do.
    const auth = betterAuth(betterAuthOptions)
    // console.log('keys:', Object.keys(auth.api))
    // console.log(`[better-auth] auth.api: ${JSON.stringify(auth.api, null, 2)}`)
    const authEndpoints = getEndpoints(auth.$context, betterAuthOptions)

    // console.log('keys authEndpoints:', Object.keys(authEndpoints.api))
    // console.log(
    //   `[better-auth] authEndpoints.api: ${JSON.stringify(authEndpoints.api, null, 2)}`,
    // )

    // const authContext = init(betterAuthOptions)
    // const authEndpoints = getEndpoints(authContext, betterAuthOptions)

    // console.log(
    //   `[better-auth] getEndpoints: ${JSON.stringify(authEndpoints.api, null, 2)}`,
    // )

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

    // if (!config.admin) {
    //   config.admin = {}
    // }

    // if (!config.admin.components) {
    //   config.admin.components = {}
    // }

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
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // const { totalDocs } = await payload.count({
      //   collection: 'plugin-collection',
      //   where: {
      //     id: {
      //       equals: 'seeded-by-plugin',
      //     },
      //   },
      // })

      // if (totalDocs === 0) {
      //   await payload.create({
      //     collection: 'plugin-collection',
      //     data: {
      //       id: 'seeded-by-plugin',
      //     },
      //   })
      // }
    }

    return config
  }
