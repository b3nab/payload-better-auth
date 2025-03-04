import type { SanitizedConfig } from 'payload'
import { headers } from 'next/headers.js'
import { guardBefore } from './guard.before.js'
import { redirect } from 'next/navigation.js'

export const isAuth = async (
  configPromise: Promise<SanitizedConfig>,
  redirectUrl?: string,
) => {
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
