import { headers } from 'next/headers'
import { serverBefore } from '../server.before'
import type { BetterAuthPluginOptions } from '../../index'
import type { SanitizedConfig } from 'payload'

export const isAuth =
  <O extends BetterAuthPluginOptions>(
    configPromise: Promise<SanitizedConfig>,
    pluginOptions: O,
  ) =>
  async () => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const response = await betterAuth.api.getSession({
      headers: await headers(),
    })

    console.log('isAuth :: ', response?.session)

    return Boolean(response?.session)
  }
