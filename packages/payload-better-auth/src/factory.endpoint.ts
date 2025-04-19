import type { Endpoint, PayloadHandler } from 'payload'
import type { AuthContext, betterAuth } from 'better-auth'
// biome-ignore lint/style/useImportType: <explanation>
import { getEndpoints } from 'better-auth/api'
import { payloadSingleton } from './singleton.payload'
import type { BetterAuthPluginOptions } from './index'
import type {
  BuildBetterAuthOptionsReturnType,
  InferBetterAuthInstance,
} from './better-auth/instance'

type AuthEndpointsApi<O extends BetterAuthPluginOptions> = ReturnType<
  typeof getEndpoints<AuthContext, BuildBetterAuthOptionsReturnType<O>>
>['api']

export class EndpointFactory<O extends BetterAuthPluginOptions> {
  betterAuthInstance: InferBetterAuthInstance<O>
  betterAuthPaths: AuthEndpointsApi<O> | undefined
  constructor(
    betterAuthInstance: InferBetterAuthInstance<O>,
    betterAuthPaths: AuthEndpointsApi<O>,
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
