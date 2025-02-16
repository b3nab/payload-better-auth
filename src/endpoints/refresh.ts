// @ts-strict-ignore
import { status as httpStatus } from 'http-status'

import {
  type PayloadHandler,
  headersWithCors,
  generatePayloadCookie,
} from 'payload'
import invariant from 'tiny-invariant'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth } from '../singleton.better-auth.js'
// import { refreshOperation } from '../operations/refresh.js'

export const refreshHandler: PayloadHandler = async (req) => {
  const collection = getRequestCollection(req)
  const { t } = req

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth not initialized')

  const response = await betterAuth.api.getSession({
    headers: req.headers,
    asResponse: true,
  })

  // const result = await refreshOperation({
  //   collection,
  //   req,
  // })

  const result = response.json()
  const headers = headersWithCors({
    headers: response.headers,
    req,
  })

  return Response.json(
    {
      message: t('authentication:tokenRefreshSuccessful'),
      ...result,
    },
    {
      headers,
      status: response.status, // httpStatus.OK,
    },
  )
}
