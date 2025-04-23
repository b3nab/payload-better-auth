import { headers } from 'next/headers.js'
import { serverBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import type { SanitizedConfig } from 'payload'

export const isAdmin =
  <O extends BetterAuthPluginOptions>(
    configPromise: Promise<SanitizedConfig>,
    pluginOptions: O,
  ) =>
  async () => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const responsePermission = await betterAuth.api.userHasPermission({
      headers: await headers(),
      body: {
        permission: {
          byRole: ['admin'],
        },
      },
    })

    console.log('isAdmin :: ', responsePermission)

    return Boolean(responsePermission.success)
  }
