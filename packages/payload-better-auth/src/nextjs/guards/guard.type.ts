import type { SanitizedConfig } from 'payload'
import type { GuardServerBefore } from '../server.before.js'

export type Guard = (
  configPromise: Promise<SanitizedConfig>,
  redirectUrl?: string,
) => Promise<{
  hasSession: boolean
  data?: any
}>
// & Awaited<ReturnType<GuardServerBefore>>
