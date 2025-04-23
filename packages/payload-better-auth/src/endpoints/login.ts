// @ts-strict-ignore
import { status as httpStatus } from 'http-status'

import type { PayloadHandler } from 'payload'
import { headersWithCors, generatePayloadCookie } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { isNumber } from '../payload-utilities/isNumber.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
import { redirect } from 'next/navigation.js'
import { getLogger } from '../singleton.logger.js'
// import { loginOperation } from '../payload-operations/login'

export const loginHandler: PayloadHandler = async (req) => {
  const logger = getLogger()
  const collection = getRequestCollection(req)
  const { searchParams, t } = req
  const depth = searchParams.get('depth')
  const authData =
    collection.config.auth?.loginWithUsername !== false
      ? {
          email: typeof req.data?.email === 'string' ? req.data.email : '',
          password:
            typeof req.data?.password === 'string' ? req.data.password : '',
          username:
            typeof req.data?.username === 'string' ? req.data.username : '',
        }
      : {
          email: typeof req.data?.email === 'string' ? req.data.email : '',
          password:
            typeof req.data?.password === 'string' ? req.data.password : '',
        }

  // const result = await loginOperation({
  //   collection,
  //   data: authData,
  //   depth: isNumber(depth) ? Number(depth) : undefined,
  //   req,
  // })

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth not initialized')

  const response = await betterAuth.api.signInEmail({
    headers: req.headers,
    body: {
      email: authData.email,
      password: authData.password,
    },
    asResponse: true,
  })

  // invariant(response, 'Failed to login')

  const result = await response.json()
  console.log('result', result)
  console.log('headers', response.headers)

  const canEnterCMS = await betterAuth.api.userHasPermission({
    body: {
      userId: result.user.id,
      permission: {
        payloadcms: ['access'],
      },
    },
  })

  logger.debug(canEnterCMS.success, '[loginHandler] canEnterCMS ==')

  invariant(canEnterCMS.success, 'cannot enter cms, permission denied.')

  logger.debug(canEnterCMS.success, '[loginHandler] SUCCESS! Entering CMS..')
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
      by: 'endpoint-login',
    }
  }

  if (collection.config.auth.removeTokenFromResponses) {
    result.token = undefined
  }

  return Response.json(
    {
      message: t('authentication:passed'),
      ...result,
      user: {
        ...result.user,
        collection: req.payload.config.admin.user,
        by: 'endpoint-login',
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
