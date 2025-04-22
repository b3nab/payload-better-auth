import type { SanitizedConfig } from 'payload'
import { getBetterAuthSafe, type BetterAuthPluginOptions } from '../index'
import { isAuth, isGuest, isUser, isAdmin, isRole } from './checkers'
// import {
//   guardAuth,
//   guardGuest,
//   guardUser,
//   guardAdmin,
//   guardRole,
// } from './guards'
import { createBetterAuthInstance } from '../better-auth/instance'

export function createAuthLayer<O extends BetterAuthPluginOptions>(
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
) {
  createBetterAuthInstance({ pluginOptions })
  return {
    // better auth instance
    auth: getBetterAuthSafe<O>(),

    // checkers
    isAuth: isAuth(configPromise, pluginOptions),
    isGuest: isGuest(configPromise, pluginOptions),
    isUser: isUser(configPromise, pluginOptions),
    isAdmin: isAdmin(configPromise, pluginOptions),
    isRole: isRole(configPromise, pluginOptions),

    // guards
    // guardAuth: guardAuth(configPromise, pluginOptions),
    // guardGuest: guardGuest(configPromise, pluginOptions),
    // guarUser: guarUser(configPromise, pluginOptions),
    // guarAdmin: guarAdmin(configPromise, pluginOptions),
    // guarRole: guarRole(configPromise, pluginOptions),
  }
}
