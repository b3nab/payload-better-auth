import { getPayload, type SanitizedConfig } from 'payload'
import invariant from 'tiny-invariant'

export const serverBefore = async (configPromise: Promise<SanitizedConfig>) => {
  // getPayload caches per process; payload.betterAuth is attached by the
  // plugin's onInit, so both instances share the same lifetime
  const payload = await getPayload({ config: configPromise })
  invariant(payload, 'Payload instance NOT FOUND.')

  const betterAuth = payload.betterAuth
  invariant(betterAuth, 'betterAuth server instance NOT FOUND.')

  return {
    payload,
    betterAuth,
  }
}

export type GuardServerBefore = typeof serverBefore
