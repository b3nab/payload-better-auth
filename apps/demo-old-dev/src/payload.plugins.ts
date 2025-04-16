import {
  betterAuthPlugin,
  type CollectionConfigExtend,
  type BetterAuthPluginOptions,
} from 'payload-better-auth'
// import { betterAuth } from 'better-auth'
// import {
//   bearer,
//   admin,
//   multiSession,
//   organization,
//   twoFactor,
//   oneTap,
//   oAuthProxy,
//   openAPI,
//   oidcProvider,
//   customSession,
// } from 'better-auth/plugins'
import { reactInvitationEmail } from './lib/email/invitation'
import { reactResetPasswordEmail } from './lib/email/reset-password'
import { resend } from './lib/email/resend'
// import { nextCookies } from 'better-auth/next-js'
// import { passkey } from 'better-auth/plugins/passkey'
// import { stripe } from '@better-auth/stripe'
// import { Stripe } from 'stripe'

const UserExtend: CollectionConfigExtend<'user'> = {
  fields: [
    {
      name: 'nickname',
      type: 'text',
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
  ],
}

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev'
const to = process.env.TEST_EMAIL || ''
const PROFESSION_PRICE_ID = {
  default: 'price_1QxWZ5LUjnrYIrml5Dnwnl0X',
  annual: 'price_1QxWZTLUjnrYIrmlyJYpwyhz',
}
const STARTER_PRICE_ID = {
  default: 'price_1QxWWtLUjnrYIrmleljPKszG',
  annual: 'price_1QxWYqLUjnrYIrmlonqPThVF',
}

export const betterAuthOptions = {
  appName: 'Better Auth Demo',
  // database: {
  //   dialect,
  //   type: process.env.USE_MYSQL ? 'mysql' : 'sqlite',
  // },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      'use server'
      const res = await resend.emails.send({
        from,
        to: to || user.email,
        subject: 'Verify your email address',
        html: `<a href="${url}">Verify your email address</a>`,
      })
      console.log(res, user.email)
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ['google', 'github', 'demo-app'],
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      'use server'
      await resend.emails.send({
        from,
        to: user.email,
        subject: 'Reset your password',
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      })
    },
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID || '',
      clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    },
  },
  // plugins: [
  //   //   organization({
  //   //     async sendInvitationEmail(data) {
  //   //       'use server'
  //   //       await resend.emails.send({
  //   //         from,
  //   //         to: data.email,
  //   //         subject: "You've been invited to join an organization",
  //   //         react: reactInvitationEmail({
  //   //           username: data.email,
  //   //           invitedByUsername: data.inviter.user.name,
  //   //           invitedByEmail: data.inviter.user.email,
  //   //           teamName: data.organization.name,
  //   //           inviteLink:
  //   //             process.env.NODE_ENV === 'development'
  //   //               ? `http://localhost:3000/accept-invitation/${data.id}`
  //   //               : `${
  //   //                   process.env.BETTER_AUTH_URL ||
  //   //                   'https://demo.better-auth.com'
  //   //                 }/accept-invitation/${data.id}`,
  //   //         }),
  //   //       })
  //   //     },
  //   //   }),
  //   //   twoFactor({
  //   //     otpOptions: {
  //   //       async sendOTP({ user, otp }) {
  //   //         'use server'
  //   //         await resend.emails.send({
  //   //           from,
  //   //           to: user.email,
  //   //           subject: 'Your OTP',
  //   //           html: `Your OTP is ${otp}`,
  //   //         })
  //   //       },
  //   //     },
  //   //   }),
  //   //   passkey(),
  //   // openAPI(),
  //   // await (async () => {
  //   //   'use server'
  //   //   const openAPIOutput = openAPI()
  //   //   return {
  //   //     ...openAPIOutput,
  //   //     endpoints: ((finalEndpoints) => {
  //   //       console.log('finalEndpoints ===== ', finalEndpoints)
  //   //       return finalEndpoints
  //   //     })(
  //   //       Object.entries(openAPIOutput.endpoints)
  //   //         .map((e) => {
  //   //           console.log('working on ENDPOINT == ', e)
  //   //           return e
  //   //         })
  //   //         .reduce(
  //   //           (acc, [k, endpoint]) => ({
  //   //             // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
  //   //             ...acc,
  //   //             [k]: async (arg: any) => {
  //   //               'use server'
  //   //               return endpoint(arg)
  //   //             },
  //   //           }),
  //   //           {},
  //   //         ),
  //   //     ),
  //   //   }
  //   // })(),
  //   ((openAPIOutput) => ({
  //     ...openAPIOutput,
  //     endpoints: ((finalEndpoints) => {
  //       console.log('finalEndpoints ===== ', finalEndpoints)
  //       return finalEndpoints
  //     })(
  //       Object.entries(openAPIOutput.endpoints).reduce((acc, [k, endpoint]) => {
  //         console.log('working on ENDPOINT == ', k, endpoint)
  //         return {
  //           // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
  //           ...acc,
  //           [k]: createServerAction(endpoint),
  //         }
  //       }, {}),
  //     ),
  //   }))(openAPI()),
  //   //   bearer(),
  //   //   admin({
  //   //     adminUserIds: ['EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB'],
  //   //   }),
  //   //   multiSession(),
  //   //   oAuthProxy(),
  //   //   nextCookies(),
  //   //   oidcProvider({
  //   //     loginPage: '/sign-in',
  //   //   }),
  //   //   oneTap(),
  //   //   customSession(async (session) => {
  //   //     return {
  //   //       ...session,
  //   //       user: {
  //   //         ...session.user,
  //   //         dd: 'test',
  //   //       },
  //   //     }
  //   //   }),
  //   //   stripe({
  //   //     stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
  //   //     stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  //   //     subscription: {
  //   //       enabled: true,
  //   //       plans: [
  //   //         {
  //   //           name: 'Starter',
  //   //           priceId: STARTER_PRICE_ID.default,
  //   //           annualDiscountPriceId: STARTER_PRICE_ID.annual,
  //   //           freeTrial: {
  //   //             days: 7,
  //   //           },
  //   //         },
  //   //         {
  //   //           name: 'Professional',
  //   //           priceId: PROFESSION_PRICE_ID.default,
  //   //           annualDiscountPriceId: PROFESSION_PRICE_ID.annual,
  //   //         },
  //   //         {
  //   //           name: 'Enterprise',
  //   //         },
  //   //       ],
  //   //     },
  //   //   }),
  // ],
} satisfies BetterAuthPluginOptions['betterAuth']

export const betterAuthPluginConfig = {
  betterAuth: betterAuthOptions,
  betterAuthPlugins: {
    organization: [
      {
        async sendInvitationEmail(data) {
          'use server'
          await resend.emails.send({
            from,
            to: data.email,
            subject: "You've been invited to join an organization",
            react: reactInvitationEmail({
              username: data.email,
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink:
                process.env.NODE_ENV === 'development'
                  ? `http://localhost:3000/accept-invitation/${data.id}`
                  : `${
                      process.env.BETTER_AUTH_URL ||
                      'https://demo.better-auth.com'
                    }/accept-invitation/${data.id}`,
            }),
          })
        },
      },
    ],
    twoFactor: [
      {
        otpOptions: {
          async sendOTP({ user, otp }) {
            'use server'
            await resend.emails.send({
              from,
              to: user.email,
              subject: 'Your OTP',
              html: `Your OTP is ${otp}`,
            })
          },
        },
      },
    ],
    passkey: true,
    openAPI: true,
    bearer: true,
    admin: true,
    //   admin({
    //     adminUserIds: ['EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB'],
    //   }),
    multiSession: true,
    oAuthProxy: true,
    //   oidcProvider({
    //     loginPage: '/sign-in',
    //   }),
    oneTap: true,
    //   customSession(async (session) => {
    //     return {
    //       ...session,
    //       user: {
    //         ...session.user,
    //         dd: 'test',
    //       },
    //     }
    //   }),
    //   stripe({
    //     stripeClient: new Stripe(process.env.STRIPE_KEY || 'sk_test_'),
    //     stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    //     subscription: {
    //       enabled: true,
    //       plans: [
    //         {
    //           name: 'Starter',
    //           priceId: STARTER_PRICE_ID.default,
    //           annualDiscountPriceId: STARTER_PRICE_ID.annual,
    //           freeTrial: {
    //             days: 7,
    //           },
    //         },
    //         {
    //           name: 'Professional',
    //           priceId: PROFESSION_PRICE_ID.default,
    //           annualDiscountPriceId: PROFESSION_PRICE_ID.annual,
    //         },
    //         {
    //           name: 'Enterprise',
    //         },
    //       ],
    //     },
    //   }),
  },
  extendsCollections: {
    user: UserExtend,
  },
  logs: 'trace',
} as const satisfies BetterAuthPluginOptions

export const plugins = [betterAuthPlugin(betterAuthPluginConfig)]
