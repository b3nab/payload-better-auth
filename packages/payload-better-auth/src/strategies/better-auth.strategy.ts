import type { AuthStrategyFunction } from 'payload'
import { payloadSingleton } from '../singleton.payload.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import { cookies as nextCookies } from 'next/headers.js'
import { formatAdminURL } from '@payloadcms/ui/shared'
import { getLogger } from '../singleton.logger.js'

/**
 * Unified Better Auth Strategy for PayloadCMS
 *
 * This single strategy handles ALL Better Auth authentication methods:
 * - Email/Password
 * - Two-Factor Authentication (TOTP)
 * - Social/OAuth (Google, GitHub, etc.)
 * - Passkey (WebAuthn)
 * - Any other Better Auth plugin except the ones that need redirects
 * in admin only the 2FA plugin is handled with a custom page
 *
 * The strategy checks:
 * 1. If a 2FA verification is pending (better-auth.two_factor cookie exists)
 * 2. Otherwise, validates the session via Better Auth's getSession API
 */
export const betterAuthStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  payloadSingleton(payload)
  const logger = getLogger()

  const twoFactorPlaceholderUserId = '00000000-0000-0000-0000-000000000000'

  // Prefer a real session over any pending 2FA cookie.
  // Otherwise, after successful 2FA verification (or if the cookie lingers),
  // we'd keep returning a placeholder user.
  const betterAuth = getBetterAuth()
  if (!betterAuth) {
    logger.warn('[strategy] [better-auth] BetterAuth not initialized')
    return { user: null }
  }

  try {
    const session = await betterAuth.api.getSession({
      headers: headers,
    })

    if (!session?.user) {
      // If no session, check for pending 2FA verification
      const cookies = await nextCookies()
      const twoFactorCookie = cookies.get('better-auth.two_factor')

      if (twoFactorCookie?.value) {
        logger.debug(
          '[strategy] [better-auth] 2FA pending - returning placeholder user',
        )

        return {
          user: {
            id: twoFactorPlaceholderUserId,
            email: 'two-factor-email',
            collection: payload.config.admin.user,
            _strategy: 'better-auth',
            _twoFactorPending: true,
            redirectTo: formatAdminURL({
              adminRoute: payload.config.routes.admin,
              path: '/two-factor-verify',
            }),
          },
          responseHeaders: new Headers({
            'x-two-factor-redirect': 'true',
          }),
        }
      }

      return { user: null }
    }

    logger.debug(
      `[strategy] [better-auth] Session found for user: ${session.user.id}`,
    )

    // Return the authenticated user
    return {
      user: {
        ...session.user,
        id: session.user.id,
        email: session.user.email,
        collection: payload.config.admin.user,
        _strategy: 'better-auth',
      },
    }
  } catch (error) {
    logger.error({ error }, '[strategy] [better-auth] Error getting session')
    return { user: null }
  }
}

