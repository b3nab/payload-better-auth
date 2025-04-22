import { getPayload, type Payload, type SanitizedConfig } from 'payload'
import { headers } from 'next/headers'
import invariant from 'tiny-invariant'
import { getBetterAuthSafe } from '../singleton.better-auth'
import { getPayload as getPayloadSingleton } from '../singleton.payload'
import type { BetterAuthPluginOptions } from '../index'

export const serverBefore = async (configPromise: Promise<SanitizedConfig>) => {
  let payload: Payload | undefined = undefined
  if (configPromise) {
    payload = await getPayload({
      config: configPromise,
    })
  } else {
    const payloadSingleton = getPayloadSingleton()
    if (payloadSingleton) {
      payload = payloadSingleton
    }
  }

  invariant(payload, 'Payload instance NOT FOUND.')

  const betterAuth = getBetterAuthSafe<BetterAuthPluginOptions>(payload)

  invariant(betterAuth, 'betterAuth server instance NOT FOUND.')

  return {
    payload,
    betterAuth,
  }
}

export type GuardServerBefore = typeof serverBefore
