import type { Endpoint } from 'payload'
import { addDataAndFileToRequest, addLocalesToRequestFromData } from 'payload'

export const wrapInternalEndpoints = (endpoints: Endpoint[]): Endpoint[] => {
  return endpoints.map((endpoint) => {
    const handler = endpoint.handler

    if (['patch', 'post'].includes(endpoint.method)) {
      endpoint.handler = async (req) => {
        await addDataAndFileToRequest(req)
        addLocalesToRequestFromData(req)
        return handler(req)
      }
    }

    return endpoint
  })
}
