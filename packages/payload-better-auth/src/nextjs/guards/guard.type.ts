import type { SanitizedConfig } from 'payload'
import type { GuardServerBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export type GuardBuilder = <O extends BetterAuthPluginOptions>(
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
) => Guard
// & Awaited<ReturnType<GuardServerBefore>>

export type Guard = (redirectUrl?: string) => Promise<{
  hasSession: boolean
  data?: any
}>
