import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import { GuardBuilder, type GuardWrap } from './guard.type.js'

export const guardGuest: GuardWrap = (configPromise, pluginOptions) =>
  GuardBuilder(async (redirectUrl?: string) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const data = await betterAuth.api.getSession({
      headers: await headers(),
    })

    // const data = await responseSession.json()

    // console.log('ISGUEST - data:: ', data)

    if (redirectUrl && data?.session.token) redirect(redirectUrl)

    const user = data?.user.id ? await payload.findByID({ collection: 'user', id: data.user.id }) : null

    return {
      hasSession: !!data?.session.token && !!data?.user,
      session: data?.session,
      user,
    }
  })
