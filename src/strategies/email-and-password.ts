import type { AuthStrategyFunction } from 'payload'
import { payloadSingleton } from '../singleton.payload.js'
import { getBetterAuth } from '../singleton.better-auth.js'

export const emailAndPasswordStrategy: AuthStrategyFunction = async ({
  headers,
  payload,
  isGraphQL,
  strategyName,
}) => {
  payloadSingleton(payload)
  console.log('[better-auth] [strategy] [emailAndPassword]')
  // console.log('emailAndPassword', headers)
  const betterAuth = getBetterAuth()
  const result = await betterAuth?.api.getSession({
    headers: headers,
  })
  console.log('getSession result', result)

  const user = result?.user
    ? {
        ...result.user,
        collection: payload.config.admin.user,
        id: result.user.id,
        email: result.user.email,
        // username: result.user.username,
      }
    : null

  return {
    user: user ?? null,
  }
}
