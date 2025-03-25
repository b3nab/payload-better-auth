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
import { getLogger } from '../singleton.logger.js'

export const meHandler: PayloadHandler = async (req) => {
  const logger = getLogger()
  console.log('meHandler')
  logger.info('[server] [meHandler]')
  const collection = getRequestCollection(req)

  const { headers, user } = req

  // const result = {
  //   user: null,
  // }

  // console.log('meHandler req: ', req)
  // const currentToken = extractJWT(req)
  // const result = await meOperation({
  //   collection,
  //   currentToken,
  //   req,
  // })

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth not initialized')

  const result = await betterAuth.api.getSession({
    headers: req.headers,
    // asResponse: true,
  })

  // invariant(result, 'Failed to get session')
  // invariant(result.session, 'No session found')

  // const result = await response.json()
  logger.trace('meHandler result', result)
  // logger.trace('headers', response.headers)

  const formatResultForPayload = () => {
    return {
      collection: collection.config.slug,
      exp: result?.session?.expiresAt,
      strategy: req.user?._strategy,
      token: result?.session?.token,
      user: {
        ...result?.user,
        collection: collection.config.slug,
        _strategy: req.user?._strategy,
        by: 'endpoint-me',
      },
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
        headers,
        req,
      }),
      status: httpStatus.OK,
    },
  )
}
