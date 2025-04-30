import { GuardBuilder, type GuardWrap } from './guard.type.js'
import { guardRole as guardRoleFunction } from './guard.role.js'

export const guardAdmin: GuardWrap = (configPromise, pluginOptions) =>
  GuardBuilder(async (redirectUrl?: string) => {
    const guardRole = guardRoleFunction()(configPromise, pluginOptions)
    if (redirectUrl) return guardRole({ role: 'admin' }, redirectUrl)
    return guardRole({ role: 'admin' })
  })
