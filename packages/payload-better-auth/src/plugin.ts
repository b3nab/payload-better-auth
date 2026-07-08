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
import type { AuthContext } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'

import {
  generatePayloadCollections,
  generatePayloadEndpoints,
} from './core/index.js'
import { createBetterAuthInstance } from './better-auth/instance.js'
import { pluginsToLoad } from './better-auth/plugins.server.js'
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
  (config: Config): Config => {
    const logger = initLogger({
      level: pluginOptions.logs || 'info',
    })
    logger.debug(`PLUGIN: payload-better-auth - initializing`)

    ///////////////////////////////////
    // Better Auth - OPTIONS (config time: no instance is created here)
    ///////////////////////////////////

    // schema and endpoint enumeration only need the options; the instance is
    // created in onInit, bound to the payload instance (payload.betterAuth)
    const authOptions = {
      ...(pluginOptions.betterAuth ?? {}),
      plugins: pluginsToLoad(pluginOptions),
    }

    // getEndpoints builds the endpoint map synchronously from the options and
    // awaits the context only inside its handlers, which are never invoked:
    // the payload endpoint handlers delegate to req.payload.betterAuth.handler
    // at request time. Enumeration (path/method) is all we consume here, so
    // this context promise is intentionally never resolved.
    const enumerationOnlyContext = new Promise<AuthContext>(() => {})

    const authEndpoints = getEndpoints(enumerationOnlyContext, authOptions)
    const betterAuthEndpoints = generatePayloadEndpoints(authEndpoints.api)
    const authTables = getAuthTables(authOptions)
    const betterAuthCollections = generatePayloadCollections(
      authOptions,
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
      Object.keys(authTables).map((key) => ({
        [authTables[key].modelName]: Object.keys(authTables[key].fields).join(
          ', ',
        ),
      })),
      'authTables with fields:',
    )

    ///////////////////////////////////////////
    // Add Better Auth - Admin Customization
    ///////////////////////////////////////////

    const twoFactorPluginEnabled = authOptions.plugins.some(
      (plugin) => plugin.id === 'two-factor',
    )

    // Check if social providers are configured
    const socialProviders = Object.keys(authOptions.socialProviders || {})

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
        // BeforeDashboard: Modal prompt for admin users to setup 2FA
        beforeDashboard: [
          ...(twoFactorPluginEnabled
            ? ['@b3nab/payload-better-auth/rsc#TwoFactorSetupPromptServer']
            : []),
          ...(config.admin?.components?.beforeDashboard || []),
        ],
        // AfterLogin: Social login buttons
        afterLogin: [
          ...(config.admin?.components?.afterLogin || []),
          ...(socialProviders.length > 0
            ? [
                {
                  path: '@b3nab/payload-better-auth/rsc#SocialLoginButtonsServer',
                  serverProps: {
                    socialProviders,
                    adminRoute: config.routes?.admin || '/admin',
                  },
                },
              ]
            : []),
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
        twoFactor: twoFactorPluginEnabled,
      },
    }

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      logger.trace(`PLUGIN: payload-better-auth - onInit`)

      // create the better-auth instance bound to this payload instance and
      // expose it as payload.betterAuth: one instance per payload instance,
      // same lifetime, no module-level state
      payload.betterAuth = createBetterAuthInstance({ pluginOptions, payload })

      // run any existing onInit after ours, so consumers can already use
      // payload.betterAuth inside their own onInit
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }
    }

    logger.trace(`PLUGIN: payload-better-auth - return`)
    return config
  }

/**
 * Identity helper: captures the host's plugin options with a `const` type
 * parameter, so array literals (betterAuth.plugins above all) keep their
 * tuple types and flow into the instance typing (payload.betterAuth,
 * createAuthLayer). Zero runtime cost.
 */
export const defineBetterAuthPluginOptions = <
  const O extends BetterAuthPluginOptions,
>(
  pluginOptions: O,
): O => pluginOptions
