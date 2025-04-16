import type { Endpoint, PayloadHandler } from 'payload'

import { addDataAndFileToRequest } from './addDataAndFileToRequest'
import { addLocalesToRequestFromData } from './addLocalesToRequest'
import { payloadSingleton } from '../singleton.payload'

export const wrapInternalEndpoints = (endpoints: Endpoint[]): Endpoint[] => {
  return endpoints.map((endpoint) => {
    const handler = endpoint.handler
    // let handler: PayloadHandler = endpoint.handler

    if (['get'].includes(endpoint.method)) {
      endpoint.handler = async (req) => {
        console.log('method', endpoint.method)
        payloadSingleton(req.payload)
        return handler(req)
      }
    }

    if (['patch', 'post'].includes(endpoint.method)) {
      endpoint.handler = async (req) => {
        await addDataAndFileToRequest(req)
        addLocalesToRequestFromData(req)
        payloadSingleton(req.payload)
        return handler(req)
      }
    }

    return endpoint
  })
}
