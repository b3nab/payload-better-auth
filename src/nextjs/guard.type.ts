import { Payload, type SanitizedConfig } from 'payload'
import type { guardBefore } from './guard.before.js'

export type Guard = (
  configPromise: Promise<SanitizedConfig>,
  redirectUrl?: string,
) => Promise<
  {
    hasSession: boolean
    data: any
  } & Awaited<ReturnType<typeof guardBefore>>
>
