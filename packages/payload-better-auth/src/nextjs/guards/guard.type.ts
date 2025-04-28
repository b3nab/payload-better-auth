import type { SanitizedConfig, User } from 'payload'
import type { GuardServerBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'

export type GuardBuilder<O extends BetterAuthPluginOptions, Args = void> = (
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
) => Guard<Args>
// & Awaited<ReturnType<GuardServerBefore>>

export type Guard<Args = void> = Args extends void
  ? (redirectUrl?: string) => Promise<GuardReturn>
  : (args: Args, redirectUrl?: string) => Promise<GuardReturn>

type GuardReturn =
  | {
      hasSession: true
      session: any
      user: any
    }
  | {
      hasSession: false
      session?: any
      user?: any
    }
