import type { SanitizedConfig } from 'payload'
import { isRole as isRoleFunction } from './check.is-role.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export const isAdmin = <O extends BetterAuthPluginOptions>(
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
) => {
  const isRole = isRoleFunction<object>(configPromise, pluginOptions)
  return async () => isRole({ role: 'admin' })
}
