import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createAuthLayer } from '@b3nab/payload-better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
// biome-ignore lint/style/useImportType: <explanation>
import { betterAuthPluginConfig } from '@/plugins/payload.better-auth'

export const { auth, isRole, guardRole } = createAuthLayer(
  configPromise,
  betterAuthPluginConfig,
)

// Check if the type inference is working correctly for the better-auth instance
const bool = false
if (bool) {
  const { api } = auth
  //      ^?
  await Promise.all([
    auth.api.getSession({
      //      ^?
      headers: await headers(),
    }),
    auth.api.listSessions({
      //      ^?
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      //      ^?
      headers: await headers(),
    }),
    auth.api.getFullOrganization({
      //      ^?
      headers: await headers(),
    }),
    auth.api.oneTapCallback({
      //      ^?
      body: { idToken: '' },
    }),
    auth.api.listPasskeys({
      //      ^?
      headers: await headers(),
    }),
    auth.api.stripeWebhook({
      //      ^?
      headers: await headers(),
    }),
    auth.api.cancelSubscription({
      //      ^?
      body: { returnUrl: '' },
    }),
    auth.api.listActiveSubscriptions({
      //      ^?
      headers: await headers(),
    }),
    auth.api.polarCheckout({
      //      ^?
      query: {
        productId: '1',
        quantity: 1,
      },
    }),
    auth.api.verifyTOTP({
      //      ^?
      body: { code: '' },
    }),
    auth.api.banUser({
      //      ^?
      body: {
        userId: '1',
        banReason: 'test',
        banExpiresIn: 1000,
      },
    }),
    auth.api.userHasPermission({
      //      ^?
      headers: await headers(),
      body: {
        role: 'admin',
        permission: {
          //  ^?
          byRole: ['admin'],
        },
      },
    }),
  ]).catch((e) => {
    console.log(e)
    throw redirect('/sign-in')
  })
}
