import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getBetterAuthSafe } from 'payload-better-auth/nextjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
// biome-ignore lint/style/useImportType: <explanation>
import { betterAuthPluginConfig } from '@/plugins/payload.better-auth'

export const auth = getBetterAuthSafe<typeof betterAuthPluginConfig>(
  //          ^?
  await getPayload({ config: configPromise }),
)

// Check if the type inference is working correctly for the better-auth instance
const bool = false
if (bool) {
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
