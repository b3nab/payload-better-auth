import type { Endpoint, PayloadHandler } from 'payload'
import type { betterAuth } from 'better-auth'
import type { getEndpoints } from 'better-auth/api'

type BetterAuthInstance = ReturnType<typeof betterAuth>
type AuthEndpointsApi = ReturnType<typeof getEndpoints>['api']

export class EndpointFactory {
  betterAuthInstance: BetterAuthInstance
  betterAuthPaths: AuthEndpointsApi | undefined
  constructor(
    betterAuthInstance: ReturnType<typeof betterAuth>,
    betterAuthPaths: AuthEndpointsApi,
  ) {
    // console.log('keys betterAuthPaths:', Object.keys(betterAuthPaths))
    this.betterAuthInstance = betterAuthInstance
    this.betterAuthPaths = betterAuthPaths
  }
  buildEndpoints(): Endpoint[] {
    if (!this.betterAuthPaths) return []

    return Object.entries(this.betterAuthPaths)
      .filter((authPath) => {
        const [key, value] = authPath
        // console.log('KEY: ', key, '\tVALUE: ', value)
        if (value?.path) return true
        return false
      })
      .reduce((acc: Endpoint[], [authPath, authEndpoint]) => {
        const endpointHandler: PayloadHandler = async (req) => {
          console.info('ENDPOINT HANDLER FOR: ', authPath)
          return this.betterAuthInstance.handler(req as Request)
        }

        if (typeof authEndpoint.method === 'string') {
          acc.push({
            path: `/auth${authEndpoint.path}`,
            method: authEndpoint.method.toLowerCase(),
            handler: endpointHandler,
          } as Endpoint)
        }

        if (Array.isArray(authEndpoint.method)) {
          for (const method of authEndpoint.method) {
            acc.push({
              path: `/auth${authEndpoint.path}`,
              method: method.toLowerCase(),
              handler: endpointHandler,
            } as Endpoint)
          }
        }

        return acc
      }, [])
  }
}
