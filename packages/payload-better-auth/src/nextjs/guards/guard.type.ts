import type { SanitizedConfig } from 'payload'
import type { GuardServerBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import type { InferInternalBetterAuthInstance } from 'src/better-auth/instance.js'

// declare module 'payload' {
//   export interface User extends UserAny {}
// }

// export interface UserAny {
//   [x: string]: any
// }

// type User = import('payload').User
// export type Session = InferInternalBetterAuthInstance['$Infer']['Session']['session']
// export type User = InferInternalBetterAuthInstance['$Infer']['Session']['user']

// @ts-ignore
export type Session = import('payload').GeneratedTypes['collections']['session']
// @ts-ignore
export type User = import('payload').GeneratedTypes['user']
// type SelectFromUser = import('payload').TypedCollectionSelect['user']
// export type User = import('payload').TransformCollectionWithSelect<
//   'user',
//   SelectFromUser
// >
// export type User = import('payload').TypedUser

export type GuardBuilder<O extends BetterAuthPluginOptions, Args = void> = (
  configPromise: Promise<SanitizedConfig>,
  pluginOptions: O,
) => Guard<Args>
// & Awaited<ReturnType<GuardServerBefore>>

export type Guard<Args = void> = Args extends void
  ? (redirectUrl?: string) => Promise<GuardReturn>
  : (args: Args, redirectUrl?: string) => Promise<GuardReturn>

type GuardReturn =
  // | {
  //     hasSession: true
  //     session: any
  //     user: User
  //   }
  {
    hasSession: boolean
    session?: Session
    user?: User
  }
