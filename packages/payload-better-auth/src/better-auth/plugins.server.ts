// biome-ignore lint/style/useImportType: <explanation>
import {
  type BetterAuthPlugin,
  // // core authentication
  twoFactor,
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  // passkey,
  genericOAuth,
  oneTap,
  // // core authorization
  admin,
  organization,
  // // core enterprise
  oidcProvider,
  // // core utility
  bearer,
  multiSession,
  oAuthProxy,
  openAPI,
  jwt,
} from 'better-auth/plugins'
// biome-ignore lint/style/useImportType: <explanation>
import { sso } from 'better-auth/plugins/sso'
// biome-ignore lint/style/useImportType: <explanation>
import { passkey } from 'better-auth/plugins/passkey'
import { stripe } from '@better-auth/stripe'
import { Stripe } from 'stripe'
import { polar } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { nextCookies } from 'better-auth/next-js'
// biome-ignore lint/style/useImportType: <explanation>
import { emailHarmony } from 'better-auth-harmony'
import type { BetterAuthPluginOptions } from '../types.js'
import { ac, roles } from './permissions.js'

// Define a mapping type for plugin names to their types
type PluginTypeMap = {
  twoFactor: typeof twoFactor
  openAPI: typeof openAPI
  admin: typeof admin
  organization: typeof organization
  oidcProvider: typeof oidcProvider
  bearer: typeof bearer
  multiSession: typeof multiSession
  oAuthProxy: typeof oAuthProxy
  jwt: typeof jwt
  emailHarmony: typeof emailHarmony
  sso: typeof sso
  passkey: typeof passkey
  genericOAuth: typeof genericOAuth
  oneTap: typeof oneTap
  emailOTP: typeof emailOTP
  // Add other potential plugins from imports if needed
  username: typeof username
  anonymous: typeof anonymous
  phoneNumber: typeof phoneNumber
  magicLink: typeof magicLink
  nextCookies: typeof nextCookies // Added nextCookies
  // payments
  stripe: typeof stripe
  polar: typeof polar
}

type AllParams<T extends (...args: any) => any> = NonNullable<Parameters<T>[0]>

// type twoFactorTyped<T extends AllParams<typeof twoFactor>> = ReturnType<typeof twoFactor<T>>
type openAPITyped<T extends AllParams<typeof openAPI>> = ReturnType<
  typeof openAPI<T>
>
type adminTyped<T extends AllParams<typeof admin>> = ReturnType<typeof admin<T>>
type organizationTyped<T extends AllParams<typeof organization>> = ReturnType<
  typeof organization<T>
>
// type oidcProviderTyped<T extends AllParams<typeof oidcProvider>> = ReturnType<typeof oidcProvider<T>>
// type bearerTyped<T extends AllParams<typeof bearer>> = ReturnType<typeof bearer<T>>
// type multiSessionTyped<T extends AllParams<typeof multiSession>> = ReturnType<typeof multiSession<T>>
// type oAuthProxyTyped<T extends AllParams<typeof oAuthProxy>> = ReturnType<typeof oAuthProxy<T>>
// type jwtTyped<T extends AllParams<typeof jwt>> = ReturnType<typeof jwt<T>>
// type emailHarmonyTyped<T extends AllParams<typeof emailHarmony>> = ReturnType<typeof emailHarmony<T>>
// type ssoTyped<T extends AllParams<typeof sso>> = ReturnType<typeof sso<T>>
// type passkeyTyped<T extends AllParams<typeof passkey>> = ReturnType<typeof passkey<T>>
// type genericOAuthTyped<T extends AllParams<typeof genericOAuth>> = ReturnType<typeof genericOAuth<T>>
// type oneTapTyped<T extends AllParams<typeof oneTap>> = ReturnType<typeof oneTap<T>>
// type emailOTPTyped<T extends AllParams<typeof emailOTP>> = ReturnType<typeof emailOTP<T>>
// Add other potential plugins from imports if needed
// type usernameTyped<T extends AllParams<typeof username>> = ReturnType<typeof username<T>>
// type anonymousTyped<T extends AllParams<typeof anonymous>> = ReturnType<typeof anonymous<T>>
// type phoneNumberTyped<T extends AllParams<typeof phoneNumber>> = ReturnType<typeof phoneNumber<T>>
// type magicLinkTyped<T extends AllParams<typeof magicLink>> = ReturnType<typeof magicLink<T>>
// type nextCookiesTyped<T extends AllParams<typeof nextCookies>> = ReturnType<typeof nextCookies // Added nextCookies<T>>
// payments
type stripeTyped<T extends AllParams<typeof stripe>> = ReturnType<
  typeof stripe<T>
>
// type polarTyped<T extends AllParams<typeof polar>> = ReturnType<typeof polar<T>>

// Helper type to ensure plugin return types are compatible with BetterAuthPlugin
type EnsureBetterAuthPlugin<T> = T extends BetterAuthPlugin
  ? T
  : BetterAuthPlugin

// type Call<F extends (args: any) => any, A> = F extends (args: A) => infer R // “invoke” F with A; if it matches (args: A) ⇒ R, capture R
//   ? R
//   : never

// type GetPluginReturnType1<
//   K extends keyof PluginTypeMap,
//   A = never,
//   // A extends Parameters<PluginTypeMap[K]> = [] & Parameters<PluginTypeMap[K]>,
// > = PluginTypeMap[K] extends (...config: infer A) => infer R
//   ? EnsureBetterAuthPlugin<R>
//   : never

// type GetPluginReturnType2<
//   K extends keyof PluginTypeMap,
//   // A = never,
//   Opts extends readonly any[] = Parameters<PluginTypeMap[K]>,
// > = PluginTypeMap[K] extends (...options: Opts) => infer R
//   ? EnsureBetterAuthPlugin<R>
//   : never

type GetPluginReturnType<
  K extends keyof PluginTypeMap,
  Args extends readonly any[] = Parameters<PluginTypeMap[K]>,
> = PluginTypeMap[K] extends (...config: infer Config) => infer R
  ? Args extends never
    ? EnsureBetterAuthPlugin<R>
    : K extends 'admin'
      ? EnsureBetterAuthPlugin<adminTyped<Args[0]>>
      : K extends 'stripe'
        ? EnsureBetterAuthPlugin<stripeTyped<Args[0]>>
        : EnsureBetterAuthPlugin<R>
  : never

// type GetPluginReturnType<
//   K extends keyof PluginTypeMap,
//   Args extends readonly any[] = Parameters<PluginTypeMap[K]>,
// > = BetterAuthPlugin

// type PluginIdMap = {
//   [K in keyof PluginTypeMap]: ReturnType<PluginTypeMap[K]>['id']
// }
// export type EnabledPluginsArrayInternal<O extends BetterAuthPluginOptions> = PluginsToLoad<O>

// type FilteredById<
//   O extends BetterAuthPluginOptions,
//   K extends keyof PluginIdMap,
// > = Extract<PluginsToLoad<O>, PluginIdMap[K]>

// type EnabledPluginsKeys<O extends BetterAuthPluginOptions> = keyof PluginTypeMap

// type EnabledPluginsKeys2<O extends BetterAuthPluginOptions> = {
//   [K in keyof O['betterAuthPlugins'] &
//     keyof PluginTypeMap]: O['betterAuthPlugins'][K] extends true
//     ? // Plugins enabled using a boolean
//       K & keyof PluginTypeMap
//     : O['betterAuthPlugins'][K] extends object
//       ? // Plugins enabled using a configuration object
//         K & keyof PluginTypeMap
//       : never
// }[keyof O['betterAuthPlugins'] & keyof PluginTypeMap]

// const TBAPO = {
//   betterAuthPlugins: {
//     // twoFactor: true,
//     // openAPI: true
//     admin: { ac, roles },
//     // polar: true,
//     passkey: true,
//     stripe: {
//       // stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
//       stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
//       subscription: {
//         enabled: true,
//         plans: [
//           {
//             name: 'Starter',
//             priceId: '',
//             annualDiscountPriceId: '',
//             freeTrial: {
//               days: 7,
//             },
//           },
//           {
//             name: 'Professional',
//             priceId: '',
//             annualDiscountPriceId: '',
//           },
//           {
//             name: 'Enterprise',
//           },
//         ],
//       },
//     },
//   },
// } satisfies BetterAuthPluginOptions

// type TBAPOKK<O extends BetterAuthPluginOptions> =
//   EnabledPluginsArray2<O>[number]['id']

// type TBAPOKKTest = TBAPOKK<typeof TBAPO>
// //     ^?
// type NARROWTest = EnabledPluginsArray<typeof TBAPO>
// //     ^?
// type S = Extract<NARROWTest[number], { id: 'stripe' }>['endpoints']
// //   ^?

// const sws = {
//   stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
//   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
//   subscription: {
//     enabled: true,
//     plans: [
//       {
//         name: 'Starter',
//         priceId: '',
//         annualDiscountPriceId: '',
//         freeTrial: {
//           days: 7,
//         },
//       },
//       {
//         name: 'Professional',
//         priceId: '',
//         annualDiscountPriceId: '',
//       },
//       {
//         name: 'Enterprise',
//       },
//     ],
//   },
// } satisfies Parameters<typeof stripe>[0]

// type StripeTypeSubscription = ReturnType<typeof stripe<typeof sws>>['endpoints']
// type PluginStripeTyped<T extends Parameters<typeof stripe>[0]> = ReturnType<
//   typeof stripe<T>
// >
// type DynStripe = PluginStripeTyped<typeof sws>['endpoints']
// type StripeTypeDynamic = GetPluginReturnType<'stripe'>['endpoints']
// type StripeTypeDynamicSWS = GetPluginReturnType<
//   'stripe',
//   [typeof sws]
// >['endpoints']

// export type EnabledPluginsArrayInternal<O extends BetterAuthPluginOptions> = Array<

// >

// type GetParams<F extends (...args: any) => any> = Parameters<F>[0]

// export type EnabledPluginsArrayInternal<O extends BetterAuthPluginOptions> = Extract<PluginsToLoad<O>, EnabledPluginsArray2<O>>
// export type EnabledPluginsArrayInternal<O extends BetterAuthPluginOptions> = FilteredById<O, EnabledPluginsKeys2<O>>
// EnabledPluginsKeys2<O>

// export type EnabledPluginsArray2<O extends BetterAuthPluginOptions> = Array<
//   // Explicitly add types for plugins always included or included by default logic if not in O['betterAuthPlugins']
//   | GetPluginReturnType<'nextCookies'>
//   | GetPluginReturnType<'twoFactor'>
//   | GetPluginReturnType<'openAPI'>
//   | GetPluginReturnType<
//       'admin',
//       [{ ac: Readonly<typeof ac>; roles: Readonly<typeof roles> }]
//     >
//   // Plugins enabled using the betterAuthPlugins
//   | {
//       [K in keyof O['betterAuthPlugins']]: O['betterAuthPlugins'][K] extends true
//         ? // Plugins enabled using a boolean
//           GetPluginReturnType<K & keyof PluginTypeMap>
//         : O['betterAuthPlugins'][K] extends object
//           ? // : O['betterAuthPlugins'][K] extends GetParams<PluginTypeMap[K & keyof PluginTypeMap]>
//             // : O['betterAuthPlugins'][K] extends Array<any>
//             // Plugins enabled using a configuration object
//             GetPluginReturnType<
//               K & keyof PluginTypeMap,
//               [O['betterAuthPlugins'][K]]
//             >
//           : never
//     }[keyof O['betterAuthPlugins']]
// >

// export type EnabledPluginsArray<O extends BetterAuthPluginOptions> =
//   // Array<
//   //   {
//   //     [K in keyof TBAPOKK<O> &
//   //       keyof O['betterAuthPlugins']]: O['betterAuthPlugins'][K] extends true
//   //       ? // Plugins enabled using a boolean
//   //         GetPluginReturnType<K & keyof PluginTypeMap>
//   //       : O['betterAuthPlugins'][K] extends object
//   //         ? // Plugins enabled using a configuration object
//   //           GetPluginReturnType<
//   //             K & keyof PluginTypeMap,
//   //             [O['betterAuthPlugins'][K]]
//   //           >
//   //         : never
//   //   }[keyof TBAPOKK<O> & keyof O['betterAuthPlugins']]
//   // >
//   Array<
//     Extract<
//       // PluginsToLoad<O>[number],
//       EnabledPluginsArray2<O>[number],
//       {
//         id: TBAPOKK<O>
//       }
//     >
//   >

export type PluginsToLoad<O extends BetterAuthPluginOptions> = ReturnType<
  typeof pluginsToLoad<O>
>
// export type PluginsToLoad<O extends BetterAuthPluginOptions> = Array<
//   DefaultPlugins<O> | UserPlugins<O>
// >

// type UserPlugins<O extends BetterAuthPluginOptions> = {
//   [K in keyof O['betterAuthPlugins'] &
//     keyof PluginTypeMap]: O['betterAuthPlugins'][K] extends true
//     ? GetPluginReturnType<K>
//     : O['betterAuthPlugins'][K] extends object
//       ? GetPluginReturnType<K, [O['betterAuthPlugins'][K]]>
//       : BetterAuthPlugin
// }[keyof O['betterAuthPlugins'] & keyof PluginTypeMap]

type UserPlugins<O extends BetterAuthPluginOptions> = ReturnType<
  typeof userPlugins<O['betterAuthPlugins']>
>[number]
type DefaultPlugins<O extends BetterAuthPluginOptions> = ReturnType<
  typeof defaultPlugins<O['betterAuthPlugins']>
>[number]

export const defaultPlugins = <
  BAP extends BetterAuthPluginOptions['betterAuthPlugins'],
>(
  inputConfig: BAP,
) => {
  const config = {
    twoFactor: inputConfig?.twoFactor ?? true,
    openAPI: inputConfig?.openAPI ?? true,
    admin: {
      ...inputConfig,
      ac: inputConfig?.admin?.ac ?? ac,
      roles: inputConfig?.admin?.roles ?? roles,
    },
  }
  return [
    nextCookies(),
    admin(config.admin),
    typeof config.openAPI === 'boolean' ? openAPI() : openAPI(config.openAPI),
    typeof config.twoFactor === 'boolean'
      ? twoFactor()
      : twoFactor(config.twoFactor),
  ]
}
export const userPlugins = <
  BAP extends BetterAuthPluginOptions['betterAuthPlugins'],
>(
  inputConfig: NonNullable<BAP>,
) => {
  const stripeConfig = {
    stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    ...(typeof inputConfig.stripe === 'boolean'
      ? {}
      : (inputConfig.stripe ?? {})),
    // subscription: {
    //   enabled: true,
    //   plans: [
    //     {
    //       name: 'Starter',
    //       priceId: 'price_1QxWWtLUjnrYIrmleljPKszG', // STARTER_PRICE_ID.default,
    //       annualDiscountPriceId: 'price_1QxWYqLUjnrYIrmlonqPThVF', // STARTER_PRICE_ID.annual,
    //       freeTrial: {
    //         days: 7,
    //       },
    //     },
    //   ],
    // },
  }

  const polarConfig = {
    client: new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      // Use 'sandbox' if you're using the Polar Sandbox environment
      // Remember that access tokens, products, etc. are completely separated between environments.
      // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
      // server: 'production',
      ...(typeof inputConfig.polar === 'object'
        ? typeof inputConfig.polar.clientConfig === 'boolean'
          ? {}
          : (inputConfig.polar?.clientConfig ?? {})
        : {}),
    }),
    ...(typeof inputConfig.polar === 'boolean'
      ? {}
      : (inputConfig.polar ?? {})),
  }

  return [
    inputConfig.username &&
      (typeof inputConfig.username === 'boolean'
        ? username()
        : username(inputConfig.username)),
    inputConfig.anonymous &&
      (typeof inputConfig.anonymous === 'boolean'
        ? anonymous()
        : anonymous(inputConfig.anonymous)),
    inputConfig.phoneNumber &&
      (typeof inputConfig.phoneNumber === 'boolean'
        ? phoneNumber()
        : phoneNumber(inputConfig.phoneNumber)),
    inputConfig.magicLink &&
      (typeof inputConfig.magicLink === 'boolean'
        ? magicLink({
            sendMagicLink: async () => {
              console.warn('No sendMagicLink implementation provided')
            },
          })
        : magicLink(inputConfig.magicLink)),
    inputConfig.emailOTP &&
      (typeof inputConfig.emailOTP === 'boolean'
        ? emailOTP({
            sendVerificationOTP: async () => {
              console.warn('No sendVerificationOTP implementation provided')
            },
          })
        : emailOTP(inputConfig.emailOTP)),
    inputConfig.passkey &&
      (typeof inputConfig.passkey === 'boolean'
        ? passkey()
        : passkey(inputConfig.passkey)),
    inputConfig.genericOAuth &&
      (typeof inputConfig.genericOAuth === 'boolean'
        ? genericOAuth({
            config: [
              {
                providerId: 'placeholder',
                clientId: 'placeholder',
                clientSecret: 'placeholder',
              },
            ],
          })
        : genericOAuth(inputConfig.genericOAuth)),
    inputConfig.oneTap &&
      (typeof inputConfig.oneTap === 'boolean'
        ? oneTap()
        : oneTap(inputConfig.oneTap)),
    inputConfig.organization &&
      (typeof inputConfig.organization === 'boolean'
        ? organization()
        : organization(inputConfig.organization)),
    inputConfig.oidcProvider &&
      (typeof inputConfig.oidcProvider === 'boolean'
        ? oidcProvider({
            loginPage: '/login',
          })
        : oidcProvider(inputConfig.oidcProvider)),
    inputConfig.bearer &&
      (typeof inputConfig.bearer === 'boolean'
        ? bearer()
        : bearer(inputConfig.bearer)),
    inputConfig.sso &&
      (typeof inputConfig.sso === 'boolean' ? sso() : sso(inputConfig.sso)),
    inputConfig.multiSession &&
      (typeof inputConfig.multiSession === 'boolean'
        ? multiSession()
        : multiSession(inputConfig.multiSession)),
    inputConfig.oAuthProxy &&
      (typeof inputConfig.oAuthProxy === 'boolean'
        ? oAuthProxy()
        : oAuthProxy(inputConfig.oAuthProxy)),
    inputConfig.jwt &&
      (typeof inputConfig.jwt === 'boolean' ? jwt() : jwt(inputConfig.jwt)),
    inputConfig.emailHarmony &&
      (typeof inputConfig.emailHarmony === 'boolean'
        ? emailHarmony()
        : emailHarmony(inputConfig.emailHarmony)),
    inputConfig.stripe && stripe(stripeConfig),
    inputConfig.polar && polar(polarConfig),
  ].filter((p) => !!p)
}

export const pluginsToLoad = <O extends BetterAuthPluginOptions>(
  pluginOptions: O,
) => [
  // default plugins
  ...defaultPlugins(pluginOptions.betterAuthPlugins),
  // user plugins
  ...userPlugins(pluginOptions.betterAuthPlugins ?? {}),
]
