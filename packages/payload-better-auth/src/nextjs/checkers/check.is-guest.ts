import { headers } from 'next/headers.js'
import { serverBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import type { SanitizedConfig } from 'payload'

export const isGuest =
  <O extends BetterAuthPluginOptions>(
    configPromise: Promise<SanitizedConfig>,
    pluginOptions: O,
  ) =>
  async () => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const response = await betterAuth.api.getSession({
      headers: await headers(),
    })

    // console.log('isGuest :: ', !response?.session)

    return Boolean(!response?.session)
  }
