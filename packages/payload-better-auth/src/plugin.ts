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
import { createBetterAuthInstance } from './better-auth/instance.js'
import { payloadSingleton } from './singleton.payload.js'
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
    const logger = initLogger({
      level: pluginOptions.logs || 'info',
    })
    const config = { ...incomingConfig }

    logger.debug(`PLUGIN: payload-better-auth - initializing`)

    ///////////////////////////////////
    // Better Auth - INSTANCE
    ///////////////////////////////////

    const auth = createBetterAuthInstance({ pluginOptions })
    const authEndpoints = getEndpoints(auth.$context, auth.options)
    const betterAuthEndpoints = generatePayloadEndpoints(
      auth,
      authEndpoints.api,
    )
    const authTables = getAuthTables(auth.options)
    const betterAuthCollections = generatePayloadCollections(
      auth.options,
      authTables,
      pluginOptions.extendsCollections,
    )

    config.endpoints = [...(config.endpoints || []), ...betterAuthEndpoints]
    config.collections = [
      ...(config.collections || []),
      ...betterAuthCollections,
    ]

    // logger.trace({ authTables: Object.keys(authTables) }, 'authTables')
    logger.debug(
      Object.keys(authTables).map((key) => ({[authTables[key].modelName]: Object.keys(authTables[key].fields).join(', ')})),
      "authTables with fields:"
    )

    ///////////////////////////////////////////
    // Add Better Auth - Admin Customization
    ///////////////////////////////////////////

    config.admin = {
      ...(config.admin ?? {}),
      components: {
        ...(config.admin?.components || {}),
        providers: [
          ...(config.admin?.components?.providers || []),
          {
            path: '@b3nab/payload-better-auth/rsc#BetterAuthServerWrapper',
            serverProps: {
              pluginOptions,
            },
          },
        ],
        views: {
          ...(config.admin?.components?.views || {}),
          SetupTwoFactor: {
            path: '/two-factor-setup',
            Component: '@b3nab/payload-better-auth/rsc#SetupTwoFactorServer',
          },
          VerifyTwoFactor: {
            path: '/two-factor-verify',
            Component: '@b3nab/payload-better-auth/rsc#VerifyTwoFactorServer',
          },
        },
      },
    }

    // // add custom config for auth flows
    config.custom = {
      ...(config.custom || {}),
      authFlows: {
        twoFactor: pluginOptions.betterAuthPlugins?.twoFactor ??
        auth.options.plugins?.some((plugin) => plugin.id === 'two-factor'),
      },
    }

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      logger.trace(`PLUGIN: payload-better-auth - onInit`)
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // attach payload instance to better-auth's payload adapter
      payloadSingleton(payload)
    }

    logger.trace(`PLUGIN: payload-better-auth - return`)
    return config
  }
