// @ts-strict-ignore
import { status as httpStatus } from 'http-status'

import type { PayloadHandler } from 'payload'
import { headersWithCors, extractJWT } from 'payload'
import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
import { headers } from 'next/headers.js'
// import { headersWithCors } from '../payload-utilities/headersWithCors.js'
// import { extractJWT } from '../payload-utilities/extractJWT.js'
// import { meOperation } from '../payload-operations/me.js'

export const meHandler: PayloadHandler = async (req) => {
  console.log('meHandler')
  const collection = getRequestCollection(req)

  // console.log('meHandler req: ', req)
  // const currentToken = extractJWT(req)
  // const result = await meOperation({
  //   collection,
  //   currentToken,
  //   req,
  // })

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth not initialized')

  const response = await betterAuth.api.getSession({
    headers: req.headers,
    asResponse: true,
  })

  // invariant(result, 'Failed to get session')
  // invariant(result.session, 'No session found')

  const result = await response.json()
  // console.log('meHandler result', result)
  // console.log('headers', response.headers)

  const formatResultForPayload = () => {
    // const { session, user } = result
    return {
      collection: collection.config.slug,
      exp: result?.session?.expiresAt,
      strategy: req.user?._strategy || 'better-auth',
      token: result?.session?.token,
      user: result?.user,
    }
  }
  // if (collection.config.auth.removeTokenFromResponses) {
  //   delete result.session.token
  // }

  return Response.json(
    {
      ...formatResultForPayload(),
      message: req.t('authentication:account'),
    },
    {
      headers: headersWithCors({
        headers: response.headers,
        req,
      }),
      status: httpStatus.OK,
    },
  )
}
