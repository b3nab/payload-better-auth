// @ts-strict-ignore
import { status as httpStatus } from 'http-status'

import type { PayloadHandler } from 'payload'
import { headersWithCors, generatePayloadCookie } from 'payload'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { isNumber } from '../payload-utilities/isNumber.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
// import { loginOperation } from '../payload-operations/login.js'

export const loginHandler: PayloadHandler = async (req) => {
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

  // const cookie = generatePayloadCookie({
  //   collectionAuthConfig: collection.config.auth,
  //   cookiePrefix: req.payload.config.cookiePrefix,
  //   token: result.token,
  // })

  if (collection.config.auth.removeTokenFromResponses) {
    result.token = undefined
  }

  return Response.json(
    {
      message: t('authentication:passed'),
      ...result,
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
