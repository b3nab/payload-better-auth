import type {
  BetterAuthDBSchema,
  DBFieldAttribute,
  DBFieldType,
} from 'better-auth/db'
import type {
  CollectionConfig,
  CollectionSlug,
  Endpoint,
  Field as PayloadField,
  FieldTypes as PayloadFieldTypes,
  PayloadHandler,
} from 'payload'
import type { AuthContext, betterAuth } from 'better-auth'
import { getEndpoints } from 'better-auth/api'
import deepmerge from '@fastify/deepmerge'
import type { BetterAuthPluginOptions } from '../types.js'
import { getLogger } from '../singleton.logger.js'
import { payloadSingleton } from '../singleton.payload.js'
import { isAdmin, isUser } from './access.js'
import type {
  BuildBetterAuthOptionsReturnType,
  InferBetterAuthInstance,
} from '../better-auth/instance.js'

type AuthEndpointsApi<O extends BetterAuthPluginOptions> = ReturnType<
  typeof getEndpoints<BuildBetterAuthOptionsReturnType<O>>
>['api']

export const generatePayloadEndpoints = <O extends BetterAuthPluginOptions>(
  betterAuthInstance: InferBetterAuthInstance<O>,
  betterAuthPaths: AuthEndpointsApi<O> | undefined,
): Endpoint[] => {
  if (!betterAuthPaths) return []

  return Object.entries(betterAuthPaths)
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
        return betterAuthInstance.handler(req as Request)
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
