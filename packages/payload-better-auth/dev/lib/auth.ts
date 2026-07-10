import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuthLayer } from '@b3nab/payload-better-auth/nextjs'
import configPromise from '@payload-config'
import { betterAuthPluginConfig } from '../payload-better-auth.config'
import type { UserWithRole } from 'better-auth/plugins'

export const {
  getAuth,
  // ^?
  // checkers
  isAuth,
  isGuest,
  isUser,
  isAdmin,
  isRole,
  // guards
  guardAuth,
  guardGuest,
  guardUser,
  guardAdmin,
  guardRole,
} = createAuthLayer(configPromise, betterAuthPluginConfig) //, roles)

type AUTH = Awaited<ReturnType<typeof getAuth>>
//    ^?

// better-auth 1.6 dropped InferSession/InferUser: derive session and user
// from the api. The admin plugin user fields live in UserWithRole, where
// 1.6 types role as plain string: the roles UNION now lives on the api
// inputs (InferAdminRolesFromOption) and on the isRole/guardRole probes
type SessionData = AUTH['$Infer']['Session']
type INFSession = SessionData['session']
//    ^?
type INFUser = SessionData['user'] & UserWithRole
//    ^?
type INFRoles = INFUser['role']
//    ^?

// if you (v) hover on role you should see (property) role: "user" | "admin" | "dev"
isRole({ role: 'dev' })
//        ^?
guardRole({ role: 'dev' })
//           ^?

// Check if the type inference is working correctly for the better-auth instance
const bool = false
if (bool) {
  const auth = await getAuth()
  //    ^?
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
    // auth.api.listPasskeys({
    //   //      ^?
    //   headers: await headers(),
    // }),
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
    // auth.api.polarCheckout({
    //   //      ^?
    //   query: {
    //     productId: '1',
    //     quantity: 1,
    //   },
    // }),
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
        role: 'dev',
        permissions: {
          //  ^?
          devarea: ['access'],
          payloadcms: ['access'],
        },
      },
    }),
  ]).catch((e) => {
    // const organizationEnabled =
    //   betterAuthPluginConfig.betterAuthPlugins.organization
    // //      ^?
    // const twoFactorEnabled = betterAuthPluginConfig.betterAuthPlugins.twoFactor
    // //      ^?
    // const passkeyEnabled = betterAuthPluginConfig.betterAuthPlugins.passkey
    // //      ^?
    // // const openAPIEnabled = betterAuthPluginConfig.betterAuthPlugins.openAPI
    // //      ^?
    // const bearerEnabled = betterAuthPluginConfig.betterAuthPlugins.bearer
    // //      ^?
    // // const adminEnabled = betterAuthPluginConfig.betterAuthPlugins.admin
    // //      ^?
    // const multiSessionEnabled =
    //   betterAuthPluginConfig.betterAuthPlugins.multiSession
    // //      ^?
    // const oAuthProxyEnabled =
    //   betterAuthPluginConfig.betterAuthPlugins.oAuthProxy
    // //      ^?
    // const oidcProviderEnabled =
    //   betterAuthPluginConfig.betterAuthPlugins.oidcProvider
    // //      ^?
    // const oneTapEnabled = betterAuthPluginConfig.betterAuthPlugins.oneTap
    // //      ^?
    // const stripeEnabled = betterAuthPluginConfig.betterAuthPlugins.stripe
    // //      ^?
    // const polarEnabled = betterAuthPluginConfig.betterAuthPlugins.polar
    //      ^?
    console.log(e)
    throw redirect('/sign-in')
  })
}
