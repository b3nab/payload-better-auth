import { status as httpStatus } from 'http-status'

import {
  type PayloadHandler,
  headersWithCors,
  generateExpiredPayloadCookie,
  Payload,
  type Auth,
  generateCookie,
} from 'payload'

import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
import { getLogger } from '../singleton.logger.js'
// import { logoutOperation } from '../payload-operations/logout'

export const logoutHandler: PayloadHandler = async (req) => {
  const logger = getLogger()
  logger.trace('[server] [logoutHandler]')
  const collection = getRequestCollection(req)
  const { t } = req

  const betterAuth = getBetterAuth()
  invariant(betterAuth, 'BetterAuth is not initialized')

  let response: Response | undefined
  let result: any

  try {
    response = await betterAuth.api.signOut({
      headers: req.headers,
      asResponse: true,
    })
    result = response ? await response.json() : undefined
  } catch (error) {
    logger.error(
      {
        error,
      },
      '[server] [logoutHandler] [error]',
    )
  }

  // const result = await logoutOperation({
  //   collection,
  //   req,
  // })

  // FIX - remove better-auth.two_factor cookie by setting expired cookie
  const headers = headersWithCors({
    headers: response?.headers ?? new Headers(),
    req,
  })
  const expiredCookie = generateExpiredBetterAuthCookie({
    collectionAuthConfig: collection.config.auth,
    cookieName: 'better-auth.two_factor',
  })
  logger.debug(
    {
      setCookies: headers.get('Set-Cookie'),
    },
    '[server] [logoutHandler] [FIX headers]',
  )
  headers.append('Set-Cookie', expiredCookie)
  // END FIX

  logger.debug(
    {
      result,
      headers,
    },
    '[server] [logoutHandler] [headers]',
  )

  if (!result) {
    return Response.json(
      {
        message: t('authentication:logoutSuccessful'),
        // message: t('error:logoutFailed'),
      },
      {
        headers,
        status: httpStatus.OK,
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
      status: response?.status ?? httpStatus.OK,
    },
  )
}

type CookieObject = {
  domain?: string
  expires?: string
  httpOnly?: boolean
  maxAge?: number
  name: string
  path?: string
  sameSite?: 'Lax' | 'None' | 'Strict'
  secure?: boolean
  value: string | undefined
}

type GeneratePayloadCookieArgs = {
  /* The auth collection config */
  collectionAuthConfig: Auth
  /* Prefix to scope the cookie */
  cookieName: string
  /* The returnAs value */
  returnCookieAsObject?: boolean
  /* The token to be stored in the cookie */
  token: string
}

export const generateExpiredBetterAuthCookie = <
  T extends Omit<GeneratePayloadCookieArgs, 'token'>,
>({
  collectionAuthConfig,
  cookieName,
  returnCookieAsObject = false,
}: T): T['returnCookieAsObject'] extends true ? CookieObject : string => {
  const sameSite =
    typeof collectionAuthConfig.cookies.sameSite === 'string'
      ? collectionAuthConfig.cookies.sameSite
      : collectionAuthConfig.cookies.sameSite
        ? 'Strict'
        : undefined

  const expires = new Date(Date.now() - 1000)

  return generateCookie<T['returnCookieAsObject']>({
    name: cookieName,
    domain: collectionAuthConfig.cookies.domain ?? undefined,
    expires,
    httpOnly: true,
    path: '/',
    returnCookieAsObject,
    sameSite,
    secure: collectionAuthConfig.cookies.secure,
  })
}
