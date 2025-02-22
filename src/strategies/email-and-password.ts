import type { AuthStrategyFunction } from 'payload'
import { payloadSingleton } from '../singleton.payload.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import { getLogger } from '../logger.js'

export const emailAndPasswordStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  payloadSingleton(payload)
  const logger = getLogger()
  logger.trace('[server] [strategy] [emailAndPassword]')
  // console.log('emailAndPassword', headers)
  const betterAuth = getBetterAuth()
  const response = await betterAuth?.api.getSession({
    headers: headers,
    asResponse: true,
  })
  const result = await response?.json()
  logger.debug(
    `[server] [strategy] [emailAndPassword] getSession result: ${!!result}`,
  )

  const user = result?.user
    ? {
        ...result.user,
        collection: payload.config.admin.user,
        id: result.user.id,
        email: result.user.email,
        // username: result.user.username,
        _strategy: 'email-and-password',
        by: 'strategy-email-and-password',
      }
    : null

  return {
    user: user ?? null,
    // responseHeaders: response?.headers ?? new Headers(),
  }
}
