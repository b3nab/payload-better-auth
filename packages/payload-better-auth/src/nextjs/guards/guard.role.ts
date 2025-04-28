import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import type { GuardBuilder } from './guard.type.js'
import type { InferRoles, IsRoleArgs } from '../checkers/check.is-role.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export const guardRole =
  <O extends BetterAuthPluginOptions>(): GuardBuilder<O, IsRoleArgs<O>> =>
  (configPromise, pluginOptions) =>
  async ({ role }, redirectUrl) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    // const data = await betterAuth.api.userHasPermission({
    //   headers: await headers(),
    //   body: {
    //     permissions: {

    //     }
    //   }
    // })

    const data = await betterAuth.api.getSession({
      headers: await headers(),
    })

    // const userID = data?.user.id

    // console.log('ISAUTH - data:: ', data)

    if (redirectUrl && !data?.session.token) redirect(redirectUrl)

    return {
      hasSession: !!data?.session.token && !!data?.user,
      session: data?.session,
      user: data?.user,
    }
  }
