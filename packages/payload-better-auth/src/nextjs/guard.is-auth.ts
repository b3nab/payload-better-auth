import { headers } from 'next/headers.js'
import { guardBefore } from './guard.before.js'
import { redirect } from 'next/navigation.js'
import type { Guard } from './guard.type.js'

export const isAuth: Guard = async (configPromise, redirectUrl) => {
  const { payload, betterAuth } = await guardBefore(configPromise)

  const data = await betterAuth.api.getSession({
    headers: await headers(),
    // asResponse: true,
  })

  // const data = await responseSession.json()

  // console.log('ISAUTH - data:: ', data)

  if (redirectUrl && !data?.session.token) redirect(redirectUrl)

  return {
    hasSession: !!data?.session.token && !!data?.user,
    data,
    payload,
    betterAuth,
  }
}
