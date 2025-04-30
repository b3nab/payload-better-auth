import type { SanitizedConfig } from 'payload'
import type { GuardServerBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import type { InferInternalBetterAuthInstance } from 'src/better-auth/instance.js'

// declare module 'payload' {
//   export interface User extends UserAny {}
// }

// type User = import('payload').User
// export type Session = InferInternalBetterAuthInstance['$Infer']['Session']['session']
// export type User = InferInternalBetterAuthInstance['$Infer']['Session']['user']

// @ts-ignore
export type Session = import('payload').GeneratedTypes['collections']['session']
// @ts-ignore
export type User = import('payload').GeneratedTypes['user']

export type GuardWrap<
  O extends BetterAuthPluginOptions = object,
  Args = void,
> = (configPromise: Promise<SanitizedConfig>, pluginOptions: O) => Guard<Args>
// & Awaited<ReturnType<GuardServerBefore>>

// export type GuardBuilder<O extends BetterAuthPluginOptions, Args = void> = (
//   configPromise: Promise<SanitizedConfig>,
//   pluginOptions: O,
// ) => Guard<Args>
// // & Awaited<ReturnType<GuardServerBefore>>

export type Guard<Args = void> = Args extends void
  ? {
      (): Promise<GuardReturn<false>>
      (redirectUrl: string): Promise<GuardReturn<true>>
    }
  : {
      (args: Args): Promise<GuardReturn<false>>
      (args: Args, redirectUrl: string): Promise<GuardReturn<true>>
    }

export type GuardReturn<HasRedirectUrl extends boolean = false> =
  HasRedirectUrl extends true
    ? {
        hasSession: true
        session: Session
        user: User
      }
    : // | {
      {
        hasSession: boolean
        session?: Session
        user?: User
      }
// (
//   |
//   {
//     hasSession: false
//     session?: undefined
//     user?: undefined
//   }
//   |{
//     hasSession: true
//     session: Session
//     user: User
//   }
// )
//     hasSession: true
//     session: any
//     user: User
//   }

export function GuardBuilder(
  fn: (redirectUrl?: string) => Promise<GuardReturn<boolean>>,
): Guard<void>
export function GuardBuilder<Args>(
  fn: (args: Args, redirectUrl?: string) => Promise<GuardReturn<boolean>>,
): Guard<Args>
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function GuardBuilder(fn: Function): any {
  // At runtime, just return a function that delegates to fn.
  return (...args: any[]) => fn(...args)
}
