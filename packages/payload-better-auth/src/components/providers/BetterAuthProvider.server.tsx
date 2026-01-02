import type { ServerComponentProps } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import type { BetterAuthPluginOptions } from '../../types.js'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { BetterAuthProvider } from './BetterAuthProvider.client.js'
import invariant from 'tiny-invariant'
import { getLogger } from '../../singleton.logger.js'
import type { FC, ReactNode } from 'react'

interface BetterAuthWrapperProps extends ServerComponentProps {
  children: ReactNode
  pluginOptions: BetterAuthPluginOptions
}

export const BetterAuthServerWrapper: FC<BetterAuthWrapperProps> = async (
  wrapperProps,
) => {
  const logger = getLogger()
  logger.trace('[server] [BetterAuthServerWrapper]')
  const { children, pluginOptions, payload, user, req } = wrapperProps

  // If we're in a pending 2FA state, force navigation to the verify page.
  // This must work on refresh too, so we do NOT rely on custom request headers.
  const isTwoFactorPending = (user as any)?._twoFactorPending === true
  if (isTwoFactorPending) {
    const verifyPath = formatAdminURL({
      adminRoute: payload.config.routes.admin,
      path: '/two-factor-verify',
    })

    const currentURL =
      typeof (req as any)?.url === 'string' ? (req as any).url : undefined

    // NOTE:
    // `PayloadRequest` is only a Partial<Request>. In some cases `req.url` can be undefined.
    // If we can't reliably determine the current pathname, we must NOT redirect,
    // otherwise we can create a redirect loop (ERR_TOO_MANY_REDIRECTS).
    if (currentURL) {
      try {
        const currentPathname = new URL(currentURL).pathname

        logger.debug({currentPathname}, 'currentPathname')

        if (!currentPathname.startsWith(verifyPath)) {
          logger.debug(
            '[server] [BetterAuthServerWrapper] pending 2FA -> redirecting',
          )
          return redirect(verifyPath)
        }
      } catch {
        // If URL parsing fails (e.g. relative URL), skip redirect and let the client handle it.
      }
    }
  }

  return (
    <BetterAuthProvider
      // pluginOptions={pluginOptions}
      // TODO: sanitaze pluginOptions, because cannot be passed to client components as is - functions are not serializable
      pluginOptions={{}}
      // payloadConfig={payload}
      authFlows={{
        twoFactor: {
          enabled: payload.config.custom?.authFlows?.twoFactor,
          redirectUrl: formatAdminURL({
            adminRoute: payload.config.routes.admin,
            path: '/two-factor-verify',
          }),
        },
      }}
    >
      {children}
    </BetterAuthProvider>
  )
}
