import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuthLayer } from '../../src'
import configPromise from '@payload-config'
import { betterAuthPluginConfig } from '../payload-better-auth.config'

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
  guardAuth,
  guardGuest,
  guardUser,
  guardAdmin,
  guardRole,
} = createAuthLayer(configPromise, betterAuthPluginConfig) //, roles)

type AUTH = typeof auth
type $INFER = AUTH['$Infer']
type Session = $INFER['Session']
type User = Session['user']
type Roles = User['role']
//    ^?

type $CONTEXT = Awaited<AUTH['$context']>
//   ^?

// type Tables = $CONTEXT["tables"]
// //   ^?
// type Options = $CONTEXT["options"]
// //   ^?
// type Plugins = Options["plugins"]
// //   ^?
// type ee = Plugins extends undefined
// //   ^?
//  ? "VABBE"
//  : Plugins extends infer PLUGIN
//   ? PLUGIN extends {
//     id: "admin"
//   }
//   ? PLUGIN
//   : "CCA"
//   : "SUCA"

// type Plugins = AUTH['options']['plugins']
// type BO = Plugins extends {
//   id: 'admin'
// } ? Plugins[number] extends infer ADM
//     ? ADM
//     : never
//   :"SUCA"

// type IDK = BO['endpoints']['setRole']['options']['metadata']['$Infer']['body']['role']
// //   ^?

// if you (v) hover on role you should see (property) role: "user" | "admin" | "dev"
isRole({ role: 'dev' })
//        ^?
guardRole({ role: 'dev' })
//           ^?

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
