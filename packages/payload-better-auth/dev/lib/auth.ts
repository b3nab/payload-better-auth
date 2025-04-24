import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getBetterAuthSafe, createAuthLayer } from '../../src'
import { betterAuthPluginConfig } from '../payload.plugins'

export const {
  auth,
  // ^?
  // checkers
  isAuth,
  isGuest,
  isUser,
  isAdmin,
  isRole,
  // guards
  // guardAuth,
  // guardGuest,
  // guardUser,
  // guardAdmin,
  // guardRole,
} = createAuthLayer(configPromise, betterAuthPluginConfig)

// export const baSafe = getBetterAuthSafe<typeof betterAuthPluginConfig>(
//   //          ^?
//   await getPayload({ config: configPromise }),
// )

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
        permissions: {
          //  ^?
          devarea: ['access'],
          payloadcms: ['access'],
        },
      },
    }),
  ]).catch((e) => {
    const organizationEnabled =
      betterAuthPluginConfig.betterAuthPlugins.organization
    //      ^?
    const twoFactorEnabled = betterAuthPluginConfig.betterAuthPlugins.twoFactor
    //      ^?
    const passkeyEnabled = betterAuthPluginConfig.betterAuthPlugins.passkey
    //      ^?
    // const openAPIEnabled = betterAuthPluginConfig.betterAuthPlugins.openAPI
    //      ^?
    const bearerEnabled = betterAuthPluginConfig.betterAuthPlugins.bearer
    //      ^?
    // const adminEnabled = betterAuthPluginConfig.betterAuthPlugins.admin
    //      ^?
    const multiSessionEnabled =
      betterAuthPluginConfig.betterAuthPlugins.multiSession
    //      ^?
    const oAuthProxyEnabled =
      betterAuthPluginConfig.betterAuthPlugins.oAuthProxy
    //      ^?
    const oidcProviderEnabled =
      betterAuthPluginConfig.betterAuthPlugins.oidcProvider
    //      ^?
    const oneTapEnabled = betterAuthPluginConfig.betterAuthPlugins.oneTap
    //      ^?
    const stripeEnabled = betterAuthPluginConfig.betterAuthPlugins.stripe
    //      ^?
    const polarEnabled = betterAuthPluginConfig.betterAuthPlugins.polar
    //      ^?
    console.log(e)
    throw redirect('/sign-in')
  })
}
