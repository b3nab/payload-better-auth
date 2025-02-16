import { status as httpStatus } from 'http-status'

import {
  type PayloadHandler,
  headersWithCors,
  generateExpiredPayloadCookie,
} from 'payload'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
// import { logoutOperation } from '../payload-operations/logout.js'

export const logoutHandler: PayloadHandler = async (req) => {
  const collection = getRequestCollection(req)
  const { t } = req

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth is not initialized')
  const response = await betterAuth.api.signOut({
    headers: req.headers,
    asResponse: true,
  })

  const result = await response.json()
  const headers = headersWithCors({
    headers: response.headers,
    req,
  })

  // const result = await logoutOperation({
  //   collection,
  //   req,
  // })

  // const headers = headersWithCors({
  //   headers: new Headers(),
  //   req,
  // })

  if (!result) {
    return Response.json(
      {
        message: t('error:logoutFailed'),
      },
      {
        headers,
        status: response.status,
        // status: httpStatus.BAD_REQUEST,
      },
    )
  }

  // const expiredCookie = generateExpiredPayloadCookie({
  //   collectionAuthConfig: collection.config.auth,
  //   config: req.payload.config,
  //   cookiePrefix: req.payload.config.cookiePrefix,
  // })

  // headers.set('Set-Cookie', expiredCookie)

  return Response.json(
    {
      message: t('authentication:logoutSuccessful'),
    },
    {
      headers,
      status: response.status,
      // status: httpStatus.OK,
    },
  )
}
