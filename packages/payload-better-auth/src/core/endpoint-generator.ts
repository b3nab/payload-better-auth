import type { Endpoint, PayloadHandler } from 'payload'

// only the enumeration surface is needed: path + method of each endpoint.
// The handlers delegate to req.payload.betterAuth at request time.
type AuthEndpointsApi = Record<
  string,
  | { path?: string; options: { method?: string | string[] } }
  | undefined
>

export const generatePayloadEndpoints = (
  betterAuthPaths: AuthEndpointsApi | undefined,
): Endpoint[] => {
  if (!betterAuthPaths) return []

  return Object.entries(betterAuthPaths).reduce(
    (acc: Endpoint[], [authPath, authEndpoint]) => {
      const path = authEndpoint?.path
      if (!path) return acc

      const endpointHandler: PayloadHandler = async (req) => {
        console.info('ENDPOINT HANDLER FOR: ', authPath)
        return req.payload.betterAuth.handler(req as Request)
      }

      if (typeof authEndpoint.options.method === 'string') {
        acc.push({
          path: `/auth${path}`,
          method: authEndpoint.options.method.toLowerCase(),
          handler: endpointHandler,
        } as Endpoint)
      }

      if (Array.isArray(authEndpoint.options.method)) {
        for (const method of authEndpoint.options.method) {
          acc.push({
            path: `/auth${path}`,
            method: method.toLowerCase(),
            handler: endpointHandler,
          } as Endpoint)
        }
      }

      return acc
    },
    [],
  )
}
