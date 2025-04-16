// @ts-strict-ignore
import { status as httpStatus } from 'http-status'

import type { PayloadHandler } from 'payload'
import { headersWithCors, generatePayloadCookie } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'

import { getRequestCollection } from '../payload-utilities/getRequestEntity'
import { isNumber } from '../payload-utilities/isNumber'
import { getBetterAuth } from '../singleton.better-auth'
import invariant from 'tiny-invariant'
import { redirect } from 'next/navigation'
import { getLogger } from '../singleton.logger'
// import { verify2faOperation } from '../payload-operations/verify2fa'

export const verify2faHandler: PayloadHandler = async (req) => {
  const logger = getLogger()
  logger.trace('[server] [verify-2fa]')
  const { searchParams, t, data } = req

  logger.debug({ data, searchParams }, '[server] [verify-2fa] debug')

  // const authData = new FormData()
  // authData.append('code', data?.password)
  // const authData = JSON.stringify(data)

  // const depth = searchParams.get('depth')
  // const authData =
  //   collection.config.auth?.verify2faWithUsername !== false
  //     ? {
  //         email: typeof req.data?.email === 'string' ? req.data.email : '',
  //         password:
  //           typeof req.data?.password === 'string' ? req.data.password : '',
  //         username:
  //           typeof req.data?.username === 'string' ? req.data.username : '',
  //       }
  //     : {
  //         email: typeof req.data?.email === 'string' ? req.data.email : '',
  //         password:
  //           typeof req.data?.password === 'string' ? req.data.password : '',
  //       }

  // const result = await verify2faOperation({
  //   collection,
  //   data: authData,
  //   depth: isNumber(depth) ? Number(depth) : undefined,
  //   req,
  // })

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth not initialized')

  // const response = await betterAuth.api.({
  //   headers: req.headers,
  //   body: authData,
  //   asResponse: true,
  // })

  const verifyTotpEndpoint = `${req.payload.getAPIURL()}/auth/two-factor/verify-totp`

  logger.debug({ verifyTotpEndpoint }, '[server] [verify-]')

  // const response = await fetch(verifyTotpEndpoint, {
  //   method: 'post',
  //   body: authData,
  //   headers: req.headers,
  // })

  const response = await betterAuth.api.verifyTOTP({
    body: data,
    headers: req.headers,
    asResponse: true,
  })

  // invariant(response, 'Failed to verify2fa')

  const result = await response.json()
  console.log('result', result)
  console.log('headers', response.headers)

  // if (result.twoFactorRedirect) {
  //   console.log('redirecting to two factor')
  //   // return redirect(`${req.payload.config.routes.admin}/two-factor`)
  //   return Response.redirect(
  //     formatAdminURL({
  //       adminRoute: req.payload.config.routes.admin,
  //       path: '/two-factor-verify',
  //     }),
  //   )
  // }

  // Check if 2FA is required
  // if (result.twoFactorRedirect) {
  //   // Construct full URL for redirect
  //   const protocol = req.headers.get('x-forwarded-proto') || 'http'
  //   const redirectUrl = new URL(
  //     formatAdminURL({
  //       adminRoute: req.payload.config.routes.admin,
  //       path: '/two-factor-verify',
  //     }),
  //     `${protocol}://${req.headers.get('host')}`,
  //   ).toString()

  //   // return redirect(redirectUrl)
  //   return Response.redirect(redirectUrl, 303)
  // }

  // const cookie = generatePayloadCookie({
  //   collectionAuthConfig: collection.config.auth,
  //   cookiePrefix: req.payload.config.cookiePrefix,
  //   token: result.token,
  // })

  if (result.twoFactorRedirect) {
    result.user = {
      ...result,
      ...result.user,
      id: 'two-factor-id',
      email: 'two-factor-email',
      collection: req.payload.config.admin.user,
      by: 'endpoint-verify2fa',
    }
  }

  // if (collection.config.auth.removeTokenFromResponses) {
  //   result.token = undefined
  // }

  return Response.json(
    {
      message: t('authentication:passed'),
      ...result,
      user: {
        ...result.user,
        by: 'endpoint-verify2fa',
      },
    },
    {
      headers: headersWithCors({
        headers: response.headers,
        req,
      }),
      // status: httpStatus.OK,
      status: response.status,
    },
  )
}
