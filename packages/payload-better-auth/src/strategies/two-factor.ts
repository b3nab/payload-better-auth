import type { AuthStrategyFunction } from 'payload'
import { payloadSingleton } from '../singleton.payload.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { formatAdminURL } from '@payloadcms/ui/shared'
import { getLogger } from '../singleton.logger.js'

const userNull = (headers?: Headers) => {
  return {
    user: null,
    responseHeaders: headers,
  }
}

export const twoFactorStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  payloadSingleton(payload)
  const logger = getLogger()
  logger.trace('[server] [strategy] [twoFactor]')

  const cookies = await nextCookies()
  const cookiesList = cookies.getAll()
  const cookiesMap = cookiesList.reduce(
    (acc, cookie) => {
      acc[cookie.name] = cookie.value
      return acc
    },
    {} as Record<string, string>,
  )
  const twoFactorSession = cookiesMap['better-auth.two_factor']
  logger.debug(
    {
      twoFactorSession,
    },
    '[server] [strategy] [twoFactor] twoFactorSession',
  )

  const responseHeaders = new Headers(headers)

  if (twoFactorSession) {
    responseHeaders.set('x-two-factor-redirect', 'true')
    // 2FA session found
    // TODO: need to find a way to verify that the 2fa session is valid
    return {
      user: {
        id: 'two-factor-id',
        email: 'two-factor-email',
        collection: payload.config.admin.user,
        redirectTo: formatAdminURL({
          adminRoute: payload.config.routes.admin,
          path: '/two-factor-verify',
        }),
        _strategy: 'two-factor',
        by: 'strategy-two-factor',
      },
      responseHeaders,
    }
    // const betterAuth = getBetterAuth()
    // const response = await betterAuth?.api.getSession({
    //   headers: headers,
    //   asResponse: true,
    // })

    // const result = await response?.json()
    // const responseHeaders = response?.headers

    // console.log('[better-auth] [strategy] [twoFactor] getSession result', result)
    // console.log('[better-auth] [strategy] [twoFactor] getSession responseHeaders', responseHeaders)

    // if (result?.user) {
    //   return {
    //     user: {
    //       id: result.user.id,
    //       email: result.user.email,
    //       collection: payload.config.admin.user,
    //       ...result.user,
    //     },
    //     responseHeaders,
    //   }
    // }
  }
  // console.log('twoFactorSession', twoFactorSession)

  // const bigHeaders = await nextHeaders()
  // console.log('bigHeaders', bigHeaders)

  // get current url
  // console.log('[better-auth] [strategy] [twoFactor] headers', headers)
  // const currentUrl = new URL(bigHeaders.get('referer')!)
  // const currentPath = currentUrl.pathname
  // console.log('currentPath', currentPath)
  // const isVerifyTwoFactorPage = currentPath.includes('two-factor-verify')

  // if (twoFactorSession && !isVerifyTwoFactorPage) {
  //   return new Response(null, {
  //     headers: {
  //       Location: `${payload.config.routes.admin}/two-factor-verify`,
  //     },
  //     status: 302,
  //   })
  // }

  // console.log('twoFactor', headers)

  // if (!response) {

  // }

  return userNull()

  // console.log('[better-auth] [strategy] [twoFactor] getSession result', result)

  // const user = result?.user
  //   ? {
  //       ...result.user,
  //       collection: payload.config.admin.user,
  //       id: result.user.id,
  //       email: result.user.email,
  //       // username: result.user.username,
  //     }
  //   : null

  // return {
  //   user: user,
  //   responseHeaders,
  // }
}
