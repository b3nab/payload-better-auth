import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import type { Guard } from './guard.type.js'

export const guardGuest: Guard = async (configPromise, redirectUrl) => {
  const { payload, betterAuth } = await serverBefore(configPromise)

  const data = await betterAuth.api.getSession({
    headers: await headers(),
    // asResponse: true,
  })

  // const data = await responseSession.json()

  // console.log('ISGUEST - data:: ', data)

  if (redirectUrl && data?.session.token) redirect(redirectUrl)

  return {
    hasSession: !!data?.session.token && !!data?.user,
    data,
    // payload,
    // betterAuth,
  }
}
