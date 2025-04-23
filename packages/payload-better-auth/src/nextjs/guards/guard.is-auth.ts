import { headers } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { serverBefore } from '../server.before.js'
import type { Guard } from './guard.type.js'

export const guardAuth: Guard = async (configPromise, redirectUrl) => {
  const { payload, betterAuth } = await serverBefore(configPromise)

  const data = await betterAuth.api.getSession({
    headers: await headers(),
    // asResponse: true,
  })

  const userID = data?.user.id

  // const data = await responseSession.json()

  // console.log('ISAUTH - data:: ', data)

  if (redirectUrl && !data?.session.token) redirect(redirectUrl)

  if (!userID)
    return {
      // message: 'user not logged',
      hasSession: false,
    }

  const user = await payload.findByID({
    collection: 'user',
    id: userID,
  })

  return {
    hasSession: !!data?.session.token && !!data?.user,
    data,
    // user: user,
    // payload,
    // betterAuth,
  }
}
