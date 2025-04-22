import { headers } from 'next/headers'
import { serverBefore } from '../server.before'
import type { BetterAuthPluginOptions } from '../../index'
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
