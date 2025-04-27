import type { SanitizedConfig } from 'payload'
import type { BetterAuthPluginOptions } from '../types.js'
import { getBetterAuthSafe } from '../singleton.better-auth.js'
import {
  createBetterAuthInstance,
  type InferBetterAuthInstance,
  type InferPlugins,
} from '../better-auth/instance.js'
import {
  isAuth,
  isGuest,
  isUser,
  isAdmin,
  isRole,
  type IsRoleArgs,
} from './checkers/index.js'
// import { DefaultRoles, InferRoles } from './checkers/check.is-role.js'
import {
  type Guard,
  guardAuth,
  //   guardGuest,
  //   guardUser,
  //   guardAdmin,
  //   guardRole,
} from './guards/index.js'
import type { admin } from 'better-auth/plugins'

type Checker<Args = void> = Args extends void
  ? () => Promise<boolean>
  : (args: Args) => Promise<boolean>

type RoleConfig = NonNullable<NonNullable<Parameters<typeof admin>[0]>['roles']>

type AuthLayer<O extends BetterAuthPluginOptions, RC extends RoleConfig> = {
  auth: InferBetterAuthInstance<O>
  isAuth: Checker
  isGuest: Checker
  isUser: Checker
  isAdmin: Checker
  isRole: Checker<IsRoleArgs<O, RC>>
  guardAuth: Guard
}

export function createAuthLayer<
  O extends BetterAuthPluginOptions,
  RC extends RoleConfig,
>(
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
  roles?: RC,
): AuthLayer<O, RC> {
  createBetterAuthInstance({ pluginOptions })
  return {
    // better auth instance
    auth: getBetterAuthSafe<O>(),

    // checkers
    isAuth: isAuth(configPromise, pluginOptions),
    isGuest: isGuest(configPromise, pluginOptions),
    isUser: isUser(configPromise, pluginOptions),
    isAdmin: isAdmin(configPromise, pluginOptions),
    isRole: isRole(configPromise, pluginOptions, roles),

    // guards
    guardAuth: guardAuth(configPromise, pluginOptions),
    // guardGuest: guardGuest(configPromise, pluginOptions),
    // guarUser: guarUser(configPromise, pluginOptions),
    // guarAdmin: guarAdmin(configPromise, pluginOptions),
    // guarRole: guarRole(configPromise, pluginOptions, roles),
  } as const
}
