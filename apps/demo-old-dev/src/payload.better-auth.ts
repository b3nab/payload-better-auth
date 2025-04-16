' use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
// biome-ignore lint/style/useImportType: <explanation>
import { betterAuthOptions, betterAuthPluginConfig } from './payload.plugins'
import { getBetterAuth } from 'payload-better-auth/nextjs'
import { betterAuth } from 'better-auth'

const auth = getBetterAuth<typeof betterAuthPluginConfig>()
//     ^?
const bool = false
if (bool && auth) {
  await Promise.all([
    auth.api.getSession({
      // ^?
      headers: await headers(),
    }),
    auth.api.listSessions({
      // ^?
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      //      ^?
      headers: await headers(),
    }),
    auth.api.getFullOrganization({
      headers: await headers(),
    }),
    auth.api.listActiveSubscriptions({
      headers: await headers(),
    }),
  ]).catch((e) => {
    console.log(e)
    throw redirect('/sign-in')
  })
  auth.api.verifyTOTP({
    body: { code: '' },
  })

  await auth.api.banUser({
    body: {
      userId: '1',
      banReason: 'test',
      banExpiresIn: 1000,
    },
  })
}
