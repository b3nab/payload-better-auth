import {
  betterAuthPlugin,
  type CollectionConfigExtend,
  type BetterAuthPluginOptions,
} from '@b3nab/payload-better-auth'
import { reactInvitationEmail } from '../lib/email/invitation'
import { reactResetPasswordEmail } from '../lib/email/reset-password'
import { resend } from '../lib/email/resend'
import { acDEMO, rolesDEMO } from '@/lib/permissions'
import { admin } from 'better-auth/plugins'
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
  plugins: [
    admin({
      ac: acDEMO,
      roles: rolesDEMO,
    }),
  ],
} satisfies BetterAuthPluginOptions['betterAuth']

export const betterAuthPluginConfig = {
  betterAuth: betterAuthOptions,
  extendsCollections: {
    user: UserExtend,
  },
  logs: 'trace',
} as const satisfies BetterAuthPluginOptions

// export const plugins = [betterAuthPlugin(betterAuthPluginConfig)]
