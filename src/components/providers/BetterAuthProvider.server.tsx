import type { ServerComponentProps } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import type { BetterAuthPluginOptions } from '../../index.js'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { BetterAuthProvider } from './BetterAuthProvider.client.js'
import invariant from 'tiny-invariant'

interface BetterAuthWrapperProps extends ServerComponentProps {
  children: React.ReactNode
  pluginOptions: BetterAuthPluginOptions
}

export const BetterAuthServerWrapper = async ({
  children,
  pluginOptions,
  payload,
  user,
  req,
}: BetterAuthWrapperProps) => {
  const cookies = await nextCookies()
  const headers = await nextHeaders()

  console.log('[server] [BetterAuthServerWrapper] [cookies]', cookies)
  console.log('[server] [BetterAuthServerWrapper] [headers]', headers)

  console.log('[server] [BetterAuthServerWrapper] [req]', req)
  console.log('[server] [BetterAuthServerWrapper] [user]', user)
  // console.log('[server] [BetterAuthServerWrapper] [payload]', payload)

  const twoFactorSession = cookies.get('better-auth.two_factor')

  // get current url
  // console.log('[better-auth] [strategy] [twoFactor] headers', headers)
  const refererURL = headers.get('referer')

  console.log('[server] [BetterAuthServerWrapper] [refererURL]', refererURL)

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
      pluginOptions={pluginOptions}
      // payloadConfig={payload}
      authFlows={{
        twoFactor: {
          enabled: !!twoFactorSession,
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
