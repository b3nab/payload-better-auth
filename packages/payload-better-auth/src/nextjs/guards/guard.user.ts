import type { GuardBuilder } from './guard.type.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import { guardRole as guardRoleFunction } from './guard.role.js'

export const guardUser: GuardBuilder<BetterAuthPluginOptions> = (
  configPromise,
  pluginOptions,
) => {
  const guardRole = guardRoleFunction()(configPromise, pluginOptions)
  return async (redirectUrl) => guardRole({ role: 'user' }, redirectUrl)
}
