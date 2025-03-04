import { getPayload, type Payload, type SanitizedConfig } from 'payload'
import { headers } from 'next/headers.js'
import invariant from 'tiny-invariant'
import { getBetterAuth } from '../singleton.better-auth.js'
import { getPayload as getPayloadSingleton } from '../singleton.payload.js'

export const guardBefore = async (configPromise: Promise<SanitizedConfig>) => {
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

  const betterAuth = getBetterAuth(payload)

  invariant(betterAuth, 'betterAuth server instance NOT FOUND.')

  return {
    payload,
    betterAuth,
  }
}
