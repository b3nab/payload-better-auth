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
import { sso } from 'better-auth/plugins/sso'
import { passkey } from 'better-auth/plugins/passkey'
import { stripe } from '@better-auth/stripe'
import { Stripe } from 'stripe'
import { nextCookies } from 'better-auth/next-js'
import { emailHarmony } from 'better-auth-harmony'
import type { BetterAuthPluginOptions } from '../index'
import { ac, roles } from './permissions'

// default plugins to load
export const defaultPlugins = [twoFactor(), openAPI(), admin({ ac, roles })]

export const pluginsToLoad = (pluginOptions: BetterAuthPluginOptions) => {
  // Build plugins array
  const plugins = []

  const config = {
    twoFactor: true,
    openAPI: true,
    admin: true,
    ...pluginOptions.betterAuthPlugins,
  }

  // Process plugin options
  // Process each plugin individually to preserve type information

  for (const key of Object.keys(config)) {
    switch (key) {
      // default plugins
      case 'twoFactor':
        plugins.push(
          typeof config.twoFactor === 'boolean'
            ? twoFactor()
            : twoFactor(config.twoFactor),
        )
        break
      case 'openAPI':
        plugins.push(
          typeof config.openAPI === 'boolean'
            ? openAPI()
            : openAPI(config.openAPI),
        )
        break
      case 'admin':
        plugins.push(
          typeof config.admin === 'boolean'
            ? admin({ ac, roles })
            : admin(config.admin),
        )
        break

      // user defined plugins
      case 'username':
        if (!config.username) break
        plugins.push(
          typeof config.username === 'boolean'
            ? username()
            : username(config.username),
        )
        break
      case 'anonymous':
        if (!config.anonymous) break
        plugins.push(
          typeof config.anonymous === 'boolean'
            ? anonymous()
            : anonymous(config.anonymous),
        )
        break
      case 'phoneNumber':
        if (!config.phoneNumber) break
        plugins.push(
          typeof config.phoneNumber === 'boolean'
            ? phoneNumber()
            : phoneNumber(config.phoneNumber),
        )
        break
      case 'magicLink':
        if (!config.magicLink) break
        plugins.push(
          typeof config.magicLink === 'boolean'
            ? magicLink({
                sendMagicLink: async () => {
                  console.warn('No sendMagicLink implementation provided')
                },
              })
            : magicLink(config.magicLink),
        )
        break
      case 'emailOTP':
        if (!config.emailOTP) break
        plugins.push(
          typeof config.emailOTP === 'boolean'
            ? emailOTP({
                sendVerificationOTP: async () => {
                  console.warn('No sendVerificationOTP implementation provided')
                },
              })
            : emailOTP(config.emailOTP),
        )
        break
      case 'passkey':
        if (!config.passkey) break
        plugins.push(
          typeof config.passkey === 'boolean'
            ? passkey()
            : passkey(config.passkey),
        )
        break
      case 'genericOAuth':
        if (!config.genericOAuth) break
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
        break
      case 'oneTap':
        if (!config.oneTap) break
        plugins.push(
          typeof config.oneTap === 'boolean' ? oneTap() : oneTap(config.oneTap),
        )
        break
      case 'organization':
        if (!config.organization) break
        plugins.push(
          typeof config.organization === 'boolean'
            ? organization()
            : organization(config.organization),
        )
        break
      case 'oidcProvider':
        if (!config.oidcProvider) break
        plugins.push(
          typeof config.oidcProvider === 'boolean'
            ? oidcProvider({
                loginPage: '/login',
              })
            : oidcProvider(config.oidcProvider),
        )
        break
      case 'sso':
        if (!config.sso) break
        plugins.push(typeof config.sso === 'boolean' ? sso() : sso(config.sso))
        break
      case 'bearer':
        if (!config.bearer) break
        plugins.push(
          typeof config.bearer === 'boolean' ? bearer() : bearer(config.bearer),
        )
        break
      case 'multiSession':
        if (!config.multiSession) break
        plugins.push(
          typeof config.multiSession === 'boolean'
            ? multiSession()
            : multiSession(config.multiSession),
        )
        break
      case 'oAuthProxy':
        if (!config.oAuthProxy) break
        plugins.push(
          typeof config.oAuthProxy === 'boolean'
            ? oAuthProxy()
            : oAuthProxy(config.oAuthProxy),
        )
        break
      case 'jwt':
        if (!config.jwt) break
        plugins.push(typeof config.jwt === 'boolean' ? jwt() : jwt(config.jwt))
        break
      case 'emailHarmony':
        if (!config.emailHarmony) break
        plugins.push(
          typeof config.emailHarmony === 'boolean'
            ? emailHarmony()
            : emailHarmony(config.emailHarmony),
        )
        break
      case 'stripe':
        if (!config.stripe) break
        plugins.push(
          typeof config.stripe === 'boolean'
            ? stripe({
                stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
                stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
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
                    {
                      name: 'Professional',
                      priceId: 'price_1QxWZ5LUjnrYIrml5Dnwnl0X', // PROFESSION_PRICE_ID.default,
                      annualDiscountPriceId: 'price_1QxWZTLUjnrYIrmlyJYpwyhz', // PROFESSION_PRICE_ID.annual,
                    },
                    {
                      name: 'Enterprise',
                    },
                  ],
                },
              })
            : stripe({
                ...config.stripe,
                stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
              }),
        )
        break
      default:
        break
    }
  }

  // Always add nextCookies
  plugins.push(nextCookies())

  return plugins
}
