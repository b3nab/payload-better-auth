
import type { PayloadHandler } from 'payload'
import { headersWithCors, generatePayloadCookie } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { isNumber } from '../payload-utilities/isNumber.js'
import { getBetterAuthSafeInternal } from '../singleton.better-auth.js'
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

  const betterAuth = getBetterAuthSafeInternal()
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

  // If 2FA redirect is required, skip permission check and return fake user
  if (result.twoFactorRedirect) {
    // IMPORTANT:
    // Payload may attempt to load user-scoped preferences (nav prefs) using `user.id`.
    // On SQL adapters, that `user_id` column is often a UUID. If we return a non-UUID
    // placeholder (e.g. "two-factor-id"), it can crash with "invalid input syntax for type uuid".
    const twoFactorPlaceholderUserId = '00000000-0000-0000-0000-000000000000'

    return Response.json(
      {
        message: t('authentication:passed'),
        ...result,
        user: {
          id: twoFactorPlaceholderUserId,
          email: 'two-factor-email',
          collection: req.payload.config.admin.user,
          by: 'endpoint-login',
          _twoFactorPending: true,
          _strategy: 'better-auth',
        },
      },
      {
        headers: headersWithCors({
          headers: response.headers,
          req,
        }),
        status: response.status,
      },
    )
  }

  // Only check permissions if we have a real user (not 2FA redirect)
  invariant(result.user, 'User not found in login response')

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
