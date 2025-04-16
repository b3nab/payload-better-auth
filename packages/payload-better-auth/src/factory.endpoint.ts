import type { Endpoint, PayloadHandler } from 'payload'
import type { betterAuth } from 'better-auth'
import type { getEndpoints } from 'better-auth/api'
import { payloadSingleton } from './singleton.payload'

type BetterAuthInstance = ReturnType<typeof betterAuth>
type AuthEndpointsApi = ReturnType<typeof getEndpoints>['api']

export class EndpointFactory {
  betterAuthInstance: BetterAuthInstance
  betterAuthPaths: AuthEndpointsApi | undefined
  constructor(
    betterAuthInstance: ReturnType<typeof betterAuth>,
    betterAuthPaths: AuthEndpointsApi,
  ) {
    // console.log('keys betterAuthPaths:', betterAuthPaths)
    this.betterAuthInstance = betterAuthInstance
    this.betterAuthPaths = betterAuthPaths
  }
  buildEndpoints(): Endpoint[] {
    if (!this.betterAuthPaths) return []

    return Object.entries(this.betterAuthPaths)
      .filter((authPath) => {
        const [key, value] = authPath
        // console.log('KEY: ', key, '\tVALUE: ', value, '\nPATH: ', value?.path)
        if (value?.path) return true
        return false
      })
      .reduce((acc: Endpoint[], [authPath, authEndpoint]) => {
        // console.log('PATH: ', authEndpoint.path)
        const endpointHandler: PayloadHandler = async (req) => {
          payloadSingleton(req.payload)
          console.info('ENDPOINT HANDLER FOR: ', authPath)
          return this.betterAuthInstance.handler(req as Request)
        }

        // console.log(
        //   authEndpoint.options.method,
        //   'method typeof ',
        //   typeof authEndpoint.options.method,
        // )

        if (typeof authEndpoint.options.method === 'string') {
          acc.push({
            path: `/auth${authEndpoint.path}`,
            method: authEndpoint.options.method.toLowerCase(),
            handler: endpointHandler,
          } as Endpoint)
        }

        if (Array.isArray(authEndpoint.options.method)) {
          for (const method of authEndpoint.options.method) {
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
