import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import {
  GuardBuilder,
  GuardReturn,
  type GuardWrap,
  Session,
  User,
} from './guard.type.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export const guardAuth: GuardWrap = (configPromise, pluginOptions) =>
  GuardBuilder(async (redirectUrl?: string) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const data = await betterAuth.api.getSession({
      headers: await headers(),
    })

    const hasSession = !!data?.session.token && !!data?.user

    // const userID = data?.user.id

    // console.log('ISAUTH - data:: ', data)

    if (!hasSession) {
      if (redirectUrl) {
        redirect(redirectUrl)
      }
      return {
        hasSession,
      }
    }
    return {
      hasSession,
      session: data.session,
      user: data.user,
    }
  })
