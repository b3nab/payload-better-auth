import type { Payload } from 'payload'

let payload: Payload | undefined = undefined

export const payloadSingleton = (payloadInstance: Payload) => {
  // console.log('>>>>>> refreshing payloadSingleton')
  payload = payloadInstance
}

export const getPayload = (throwError = false) => {
  if (throwError && !payload) {
    throw new Error('Payload is not initialized')
  }
  return payload
}
