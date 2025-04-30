import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import { GuardBuilder, GuardReturn, type GuardWrap } from './guard.type.js'
import type { InferRoles, IsRoleArgs } from '../checkers/check.is-role.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export const guardRole =
  <O extends BetterAuthPluginOptions>(): GuardWrap<O, IsRoleArgs<O>> =>
  (configPromise, pluginOptions) =>
    GuardBuilder<IsRoleArgs<O>>(async ({ role }, redirectUrl) => {
      const { payload, betterAuth } = await serverBefore(configPromise)

      const data = await betterAuth.api.getSession({
        headers: await headers(),
      })

      const hasSession = !!data?.session.token && !!data?.user
      const hasRole = hasSession && data.user.role === role

      if (!hasRole) {
        if (redirectUrl) {
          redirect(redirectUrl)
        }
        return {
          hasSession: hasRole,
        }
      }

      // const userID = data?.user.id

      // console.log('ISAUTH - data:: ', data)

      return {
        hasSession: hasRole,
        session: data?.session,
        user: data?.user,
      }
    })
