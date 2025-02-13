import { betterAuth } from 'better-auth'
import { payloadAdapter } from './payload-adapter.js'
import type { Payload } from 'payload'

export const auth = (payload: Payload) =>
  betterAuth({
    appName: 'Payload CMS',
    baseURL: undefined,
    basePath: '/api/auth',
    /**
     * The secret to use for encryption,
     * signing and hashing.
     *
     * By default better auth will look for
     * the following environment variables:
     * process.env.BETTER_AUTH_SECRET,
     * process.env.AUTH_SECRET
     * If none of these environment
     * variables are set,
     * it will default to
     * "better-auth-secret-123456789".
     *
     * on production if it's not set
     * it will throw an error.
     *
     * you can generate a good secret
     * using the following command:
     * @example
     * ```bash
     * openssl rand -base64 32
     * ```
     */
    secret: undefined,
    database: payloadAdapter({
      // adapter configs
      payload,
    }),
    secondaryStorage: undefined,
    emailVerification: undefined,
    emailAndPassword: undefined,
    socialProviders: undefined,
    plugins: undefined,
    user: undefined,
    session: undefined,
    account: undefined,
    verification: undefined,
    trustedOrigins: undefined,
    rateLimit: undefined,
    advanced: undefined,
    logger: undefined,
    databaseHooks: undefined,
    onAPIError: undefined,
    hooks: undefined,
    disabledPaths: undefined,
  })
