import { headers } from 'next/headers'
import { serverBefore } from '../server.before'
import type { BetterAuthPluginOptions } from '../../index'
import type { SanitizedConfig } from 'payload'

export const isUser =
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
          byRole: ['user'],
        },
      },
    })

    console.log('isUser :: ', responsePermission)

    return Boolean(responsePermission.success)
  }
