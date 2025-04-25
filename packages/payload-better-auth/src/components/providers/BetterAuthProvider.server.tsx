import type { ServerComponentProps } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import type { BetterAuthPluginOptions } from '../../types.js'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { BetterAuthProvider } from './BetterAuthProvider.client.js'
import invariant from 'tiny-invariant'
import { getLogger } from '../../singleton.logger.js'
import type { ReactNode, JSX } from 'react'

interface BetterAuthWrapperProps extends ServerComponentProps {
  children: ReactNode
  pluginOptions: BetterAuthPluginOptions
}

export const BetterAuthServerWrapper = async (
  wrapperProps: BetterAuthWrapperProps,
): Promise<JSX.Element> => {
  const logger = getLogger()
  logger.trace('[server] [BetterAuthServerWrapper]')
  const { children, pluginOptions, payload, user, req } = wrapperProps
  // console.log('[server] [BetterAuthServerWrapper] [wrapperProps]', wrapperProps)
  const cookies = await nextCookies()
  const headers = await nextHeaders()

  // logger.debug(
  //   pluginOptions,
  //   '[server] [BetterAuthServerWrapper] [pluginOptions]',
  // )
  // logger.debug(
  //   {
  //     cookies,
  //     headers,
  //     req,
  //     user,
  //   },
  //   '[server] [BetterAuthServerWrapper]',
  // )

  // logger.debug(
  //   `[server] [BetterAuthServerWrapper] [cookies]: ${String(cookies)}`,
  // )
  // logger.debug(
  //   `[server] [BetterAuthServerWrapper] [headers]: ${String(headers)}`,
  // )

  // logger.debug(`[server] [BetterAuthServerWrapper] [req]: ${String(req)}`)
  // logger.debug(`[server] [BetterAuthServerWrapper] [user]: ${String(user)}`)
  // console.log('[server] [BetterAuthServerWrapper] [payload]', payload)

  const twoFactorSession = cookies.get('better-auth.two_factor')
  const redirected = headers.get('x-two-factor-redirect')

  if (twoFactorSession && redirected) {
    logger.debug(
      `[server] [BetterAuthServerWrapper] [redirected]: ${String(redirected)}`,
    )
    return redirect(
      formatAdminURL({
        adminRoute: payload.config.routes.admin,
        path: '/two-factor-verify',
      }),
    )
  }

  // get current url
  // console.log('[better-auth] [strategy] [twoFactor] headers', headers)

  // invariant(refererURL, 'Referer URL is required')

  // Check if 2FA is required
  // if (twoFactorSession && refererURL) {
  //   const currentUrl = new URL(refererURL)
  //   const currentPath = currentUrl.pathname
  //   console.log('currentPath', currentPath)
  //   const isVerifyTwoFactorPage = currentPath.includes('two-factor-verify')
  //   if (!isVerifyTwoFactorPage) {
  //     // Construct full URL for redirect
  //     const protocol = headers.get('x-forwarded-proto') || 'http'
  //     const redirectUrl = new URL(
  //       formatAdminURL({
  //         adminRoute: payload.config.routes.admin,
  //         path: '/two-factor-verify',
  //       }),
  //       `${protocol}://${headers.get('host')}`,
  //     ).toString()

  //     return redirect(redirectUrl)
  //   }
  // }

  // if (twoFactorSession && !isVerifyTwoFactorPage) {
  //   return new Response(null, {
  //     headers: {
  //       Location: `${payload.config.routes.admin}/two-factor-verify`,
  //     },
  //     status: 302,
  //   })
  // }

  return (
    <BetterAuthProvider
      // pluginOptions={pluginOptions}
      // TODO: sanitaze pluginOptions, because cannot be passed to client components as is - functions are not serializable
      pluginOptions={{}}
      // payloadConfig={payload}
      authFlows={{
        twoFactor: {
          enabled: payload.config.custom.authFlows.twoFactor,
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
