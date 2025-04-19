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
import type { BetterAuthPluginOptions } from '../index'
import { ac, roles } from './permissions'

// Helper to get the return type when plugin is enabled with configuration object
// We infer the function's parameter and return types based on the plugin key
type GetPluginReturnTypeWithConfig<
  K extends keyof PluginTypeMap,
  Config,
> = PluginTypeMap[K] extends (config: infer ConfigType) => infer R
  ? Config extends ConfigType
    ? EnsureBetterAuthPlugin<R>
    : never
  : never

type BAPKeys = keyof BetterAuthPluginOptions['betterAuthPlugins']

// type KeysOfPluginsFromConfig = Array<
//   {}[]
// >

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

// Helper type to ensure plugin return types are compatible with BetterAuthPlugin
type EnsureBetterAuthPlugin<T> = T extends BetterAuthPlugin ? T : never

type GetPluginReturnType<
  K extends keyof PluginTypeMap,
  A = never,
  // A extends Parameters<PluginTypeMap[K]> = [] & Parameters<PluginTypeMap[K]>,
> = PluginTypeMap[K] extends (...config: infer A) => infer R
  ? EnsureBetterAuthPlugin<R>
  : never

type PluginIdMap = {
  [K in keyof PluginTypeMap]: ReturnType<PluginTypeMap[K]>['id']
}
// export type EnabledPluginsArray<O extends BetterAuthPluginOptions> = PluginsToLoad<O>

type FilteredById<
  O extends BetterAuthPluginOptions,
  K extends keyof PluginIdMap,
> = Extract<PluginsToLoad<O>, PluginIdMap[K]>

type EnabledPluginsKeys<O extends BetterAuthPluginOptions> = keyof PluginTypeMap

type EnabledPluginsKeys2<O extends BetterAuthPluginOptions> = {
  [K in keyof O['betterAuthPlugins'] &
    keyof PluginTypeMap]: O['betterAuthPlugins'][K] extends true
    ? // Plugins enabled using a boolean
      K & keyof PluginTypeMap
    : O['betterAuthPlugins'][K] extends object
      ? // Plugins enabled using a configuration object
        K & keyof PluginTypeMap
      : never
}[keyof O['betterAuthPlugins'] & keyof PluginTypeMap]

const TBAPO = {
  betterAuthPlugins: {
    // twoFactor: true,
    // openAPI: true
    admin: { ac, roles },
    stripe: true,
    polar: true,
    passkey: true,
  },
} satisfies BetterAuthPluginOptions

type TBAPOKK<O extends BetterAuthPluginOptions> =
  EnabledPluginsArray<O>[number]['id']

type TBAPOKKTest = TBAPOKK<typeof TBAPO>

// export type EnabledPluginsArray<O extends BetterAuthPluginOptions> = Array<

// >

// export type EnabledPluginsArray<O extends BetterAuthPluginOptions> = Extract<PluginsToLoad<O>, EnabledPluginsArray2<O>>
// export type EnabledPluginsArray<O extends BetterAuthPluginOptions> = FilteredById<O, EnabledPluginsKeys2<O>>
// EnabledPluginsKeys2<O>

export type EnabledPluginsArray<O extends BetterAuthPluginOptions> = Array<
  // Explicitly add types for plugins always included or included by default logic if not in O['betterAuthPlugins']
  | GetPluginReturnType<'nextCookies'>
  | GetPluginReturnType<'twoFactor'>
  | GetPluginReturnType<'openAPI'>
  | GetPluginReturnType<'admin', [undefined]>
  // Plugins enabled using the betterAuthPlugins
  | {
      [K in keyof O['betterAuthPlugins']]: O['betterAuthPlugins'][K] extends true
        ? // Plugins enabled using a boolean
          GetPluginReturnType<K & keyof PluginTypeMap>
        : O['betterAuthPlugins'][K] extends object
          ? // Plugins enabled using a configuration object
            GetPluginReturnType<
              K & keyof PluginTypeMap,
              [O['betterAuthPlugins'][K]]
            >
          : never
    }[keyof O['betterAuthPlugins']]
>

export type EnabledPluginsArrayNarrowed<O extends BetterAuthPluginOptions> =
  Array<
    {
      [K in keyof TBAPOKK<O> &
        keyof O['betterAuthPlugins']]: O['betterAuthPlugins'][K] extends true
        ? // Plugins enabled using a boolean
          GetPluginReturnType<K & keyof PluginTypeMap>
        : O['betterAuthPlugins'][K] extends object
          ? // Plugins enabled using a configuration object
            GetPluginReturnType<
              K & keyof PluginTypeMap,
              [O['betterAuthPlugins'][K]]
            >
          : never
    }[keyof TBAPOKK<O> & keyof O['betterAuthPlugins']]
  >
// Extract<
//   PluginsToLoad<O>[number],
//   {
//     id: TBAPOKK<O>
//   }
// >

// default plugins to load
export const defaultPlugins = [twoFactor(), openAPI(), admin({ ac, roles })]

export type PluginsToLoad<O extends BetterAuthPluginOptions> = ReturnType<
  typeof pluginsToLoad<O>
>

export const pluginsToLoad = <O extends BetterAuthPluginOptions>(
  pluginOptions: O,
) => {
  // Build plugins array
  const plugins = []

  const config = {
    twoFactor: true,
    openAPI: true,
    admin: { ac, roles },
    ...pluginOptions.betterAuthPlugins,
  }

  // Always add nextCookies
  plugins.push(nextCookies())
  // default plugins
  plugins.push(
    typeof config.twoFactor === 'boolean'
      ? twoFactor()
      : twoFactor(config.twoFactor),
    typeof config.openAPI === 'boolean' ? openAPI() : openAPI(config.openAPI),
    typeof config.admin === 'boolean' ? admin() : admin(config.admin),
  )

  // user defined plugins
  if (config.username) {
    plugins.push(
      typeof config.username === 'boolean'
        ? username()
        : username(config.username),
    )
  }
  if (config.anonymous) {
    plugins.push(
      typeof config.anonymous === 'boolean'
        ? anonymous()
        : anonymous(config.anonymous),
    )
  }
  if (config.phoneNumber) {
    plugins.push(
      typeof config.phoneNumber === 'boolean'
        ? phoneNumber()
        : phoneNumber(config.phoneNumber),
    )
  }
  if (config.magicLink) {
    plugins.push(
      typeof config.magicLink === 'boolean'
        ? magicLink({
            sendMagicLink: async () => {
              console.warn('No sendMagicLink implementation provided')
            },
          })
        : magicLink(config.magicLink),
    )
  }
  if (config.emailOTP) {
    plugins.push(
      typeof config.emailOTP === 'boolean'
        ? emailOTP({
            sendVerificationOTP: async () => {
              console.warn('No sendVerificationOTP implementation provided')
            },
          })
        : emailOTP(config.emailOTP),
    )
  }
  if (config.passkey) {
    plugins.push(
      typeof config.passkey === 'boolean' ? passkey() : passkey(config.passkey),
    )
  }
  if (config.genericOAuth) {
    plugins.push(
      typeof config.genericOAuth === 'boolean'
        ? genericOAuth({
            config: [
              {
                providerId: 'placeholder',
                clientId: 'placeholder',
                clientSecret: 'placeholder',
              },
            ],
          })
        : genericOAuth(config.genericOAuth),
    )
  }
  if (config.oneTap) {
    plugins.push(
      typeof config.oneTap === 'boolean' ? oneTap() : oneTap(config.oneTap),
    )
  }
  if (config.organization) {
    plugins.push(
      typeof config.organization === 'boolean'
        ? organization()
        : organization(config.organization),
    )
  }
  if (config.oidcProvider) {
    plugins.push(
      typeof config.oidcProvider === 'boolean'
        ? oidcProvider({
            loginPage: '/login',
          })
        : oidcProvider(config.oidcProvider),
    )
  }
  if (config.bearer) {
    plugins.push(
      typeof config.bearer === 'boolean' ? bearer() : bearer(config.bearer),
    )
  }
  if (config.sso) {
    plugins.push(typeof config.sso === 'boolean' ? sso() : sso(config.sso))
  }
  if (config.multiSession) {
    plugins.push(
      typeof config.multiSession === 'boolean'
        ? multiSession()
        : multiSession(config.multiSession),
    )
  }
  if (config.oAuthProxy) {
    plugins.push(
      typeof config.oAuthProxy === 'boolean'
        ? oAuthProxy()
        : oAuthProxy(config.oAuthProxy),
    )
  }
  if (config.jwt) {
    plugins.push(typeof config.jwt === 'boolean' ? jwt() : jwt(config.jwt))
  }
  if (config.emailHarmony) {
    plugins.push(
      typeof config.emailHarmony === 'boolean'
        ? emailHarmony()
        : emailHarmony(config.emailHarmony),
    )
  }
  if (config.jwt) {
    plugins.push(typeof config.jwt === 'boolean' ? jwt() : jwt(config.jwt))
  }
  if (config.emailHarmony) {
    plugins.push(
      typeof config.emailHarmony === 'boolean'
        ? emailHarmony()
        : emailHarmony(config.emailHarmony),
    )
  }

  // workaround for stripe plugin otherwise it will not create the correct instance of better-auth
  if (config.stripe) {
    const stripeConfig = {
      stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      ...(typeof config.stripe === 'boolean' ? {} : (config.stripe ?? {})),
      subscription: {
        enabled: true,
        plans: [
          {
            name: 'Starter',
            priceId: 'price_1QxWWtLUjnrYIrmleljPKszG', // STARTER_PRICE_ID.default,
            annualDiscountPriceId: 'price_1QxWYqLUjnrYIrmlonqPThVF', // STARTER_PRICE_ID.annual,
            freeTrial: {
              days: 7,
            },
          },
        ],
      },
    }
    plugins.push(stripe(stripeConfig))
    // if (!config.stripe) {
    //   plugins.pop()
    // }
  }

  // plugins.push(
  //   stripe({
  //     stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
  //     stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  //     subscription: {
  //       enabled: true,
  //       plans: [
  //         {
  //           name: 'Starter',
  //           priceId: 'price_1QxWWtLUjnrYIrmleljPKszG', // STARTER_PRICE_ID.default,
  //           annualDiscountPriceId: 'price_1QxWYqLUjnrYIrmlonqPThVF', // STARTER_PRICE_ID.annual,
  //           freeTrial: {
  //             days: 7,
  //           },
  //         },
  //         {
  //           name: 'Professional',
  //           priceId: 'price_1QxWZ5LUjnrYIrml5Dnwnl0X', // PROFESSION_PRICE_ID.default,
  //           annualDiscountPriceId: 'price_1QxWZTLUjnrYIrmlyJYpwyhz', // PROFESSION_PRICE_ID.annual,
  //         },
  //         {
  //           name: 'Enterprise',
  //         },
  //       ],
  //     },
  //   }),
  // )

  if (config.polar) {
    plugins.push(
      typeof config.polar === 'boolean'
        ? polar({
            client: new Polar({
              accessToken: process.env.POLAR_ACCESS_TOKEN!,
              // Use 'sandbox' if you're using the Polar Sandbox environment
              // Remember that access tokens, products, etc. are completely separated between environments.
              // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
              // server: 'production',
            }),
          })
        : polar({
            client: new Polar({
              accessToken: process.env.POLAR_ACCESS_TOKEN!,
              // Use 'sandbox' if you're using the Polar Sandbox environment
              // Remember that access tokens, products, etc. are completely separated between environments.
              // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
              // server: 'production',
              ...(typeof config.polar.clientConfig === 'boolean'
                ? {}
                : (config.polar.clientConfig ?? {})),
            }),
            ...(typeof config.polar === 'boolean' ? {} : (config.polar ?? {})),
          }),
    )
  }

  return plugins
}
