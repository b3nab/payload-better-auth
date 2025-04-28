import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import type { GuardBuilder } from './guard.type.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export const guardAuth: GuardBuilder<BetterAuthPluginOptions> =
  (configPromise, pluginOptions) => async (redirectUrl) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

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
