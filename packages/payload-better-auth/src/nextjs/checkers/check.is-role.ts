import { headers } from 'next/headers'
import { serverBefore } from '../server.before'
import type { BetterAuthPluginOptions } from '../../index'
import type { SanitizedConfig } from 'payload'

type Roles<O extends BetterAuthPluginOptions> = O['betterAuthPlugins'] extends {
  admin: infer ADM
}
  ? ADM extends { roles: infer ADMROLES }
    ? keyof ADMROLES
    : 'user' | 'admin'
  : 'user' | 'admin'

type IsRoleArgs<O extends BetterAuthPluginOptions> = {
  role: Roles<O>
}

export const isRole =
  <O extends BetterAuthPluginOptions>(
    configPromise: Promise<SanitizedConfig>,
    pluginOptions: O,
  ) =>
  async ({ role }: IsRoleArgs<O>) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const responsePermission = await betterAuth.api.userHasPermission({
      headers: await headers(),
      body: {
        permission: {
          byRole: [role],
        },
      },
    })

    console.log('isRole :: ', responsePermission)

    return Boolean(responsePermission.success)
  }
