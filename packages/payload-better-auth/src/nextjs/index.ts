import { getPayload, type SanitizedConfig } from 'payload'
import type {
  BetterAuthPluginOptions,
  ResolvedBetterAuthInstance,
} from '../types.js'
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
  guardGuest,
  guardUser,
  guardAdmin,
  guardRole,
} from './guards/index.js'

type Checker<Args = void> = Args extends void
  ? () => Promise<boolean>
  : (args: Args) => Promise<boolean>

type AuthLayer<O extends BetterAuthPluginOptions> = {
  getAuth: () => Promise<ResolvedBetterAuthInstance>
  isAuth: Checker
  isGuest: Checker
  isUser: Checker
  isAdmin: Checker
  isRole: Checker<IsRoleArgs<O>>
  guardAuth: Guard
  guardGuest: Guard
  guardUser: Guard
  guardAdmin: Guard
  guardRole: Guard<IsRoleArgs<O>>
}

export function createAuthLayer<const O extends BetterAuthPluginOptions>(
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
): AuthLayer<O> {
  return {
    // the real payload.betterAuth: the instance is born in the plugin's
    // onInit, bound to payload, so the access is a function (getPayload
    // caches per process). Host typing comes from PayloadBetterAuthRegister
    // (see types.ts): no cast, no imitation
    getAuth: async () =>
      (await getPayload({ config: configPromise })).betterAuth,

    // checkers
    isAuth: isAuth(configPromise, pluginOptions),
    isGuest: isGuest(configPromise, pluginOptions),
    isUser: isUser(configPromise, pluginOptions),
    isAdmin: isAdmin(configPromise, pluginOptions),
    isRole: isRole(configPromise, pluginOptions),

    // guards
    guardAuth: guardAuth(configPromise, pluginOptions),
    guardGuest: guardGuest(configPromise, pluginOptions),
    guardUser: guardUser(configPromise, pluginOptions),
    guardAdmin: guardAdmin(configPromise, pluginOptions),
    guardRole: guardRole<O>()(configPromise, pluginOptions),
  } as const
}
