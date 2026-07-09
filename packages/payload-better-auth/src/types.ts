import type { CollectionConfig, CollectionSlug } from 'payload'
import type { BetterAuthOptions } from 'better-auth/minimal'
import type { BetterAuthPlugin } from 'better-auth'
import type { LoggerConfig } from './singleton.logger.js'
import type {
  InferBetterAuthInstance,
  InferInternalBetterAuthInstance,
} from './better-auth/instance.js'

export type CollectionConfigExtend<T extends CollectionSlug> = Omit<
  CollectionConfig<T>,
  'slug'
>

export type BetterAuthPluginOptions = Readonly<{
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   * This config will override the default ones from the plugin itself.
   *
   * `plugins` is readonly so that a `const` type parameter can capture the
   * host's array literal as a tuple: better-auth infers plugin schema fields
   * only from tuples (a mutable array constraint would block the capture).
   */
  betterAuth?: Omit<BetterAuthOptions, 'database' | 'plugins'> & {
    plugins?: readonly BetterAuthPlugin[]
  }

  /**
   * Extends collections from better-auth
   *
   */
  extendsCollections?: {
    [K in CollectionSlug]?: CollectionConfigExtend<K>
  }
  /**
   * Set the log level for the plugin.
   * @default 'info'
   */
  logs?: false | LoggerConfig['level'] // 'debug' | 'info' | 'warn' | 'error'
}>

/**
 * Type registry, same pattern payload uses for its generated types
 * (GeneratedTypes): an empty interface the host project fills once via
 * declaration merging, next to its plugin config:
 *
 * ```ts
 * declare module '@b3nab/payload-better-auth' {
 *   interface PayloadBetterAuthRegister {
 *     pluginOptions: typeof betterAuthPluginConfig
 *   }
 * }
 * ```
 *
 * With that in place `payload.betterAuth` is host-typed everywhere (host
 * plugins included). Without it, every access errors with
 * {@link BetterAuthNotRegistered}, which spells out the registration to add.
 */

// biome-ignore lint/suspicious/noEmptyInterface: registry interface, filled by the host via declaration merging
export interface PayloadBetterAuthRegister {}

/**
 * Compile-time error for hosts that did not fill the registry: every access
 * on `payload.betterAuth` surfaces the message below instead of silently
 * degrading to the internal base type, so the missing registration is
 * discovered immediately.
 */
export type BetterAuthNotRegistered = {
  'ERROR: payload.betterAuth is untyped because PayloadBetterAuthRegister is empty. Add next to your plugin options: declare module "@b3nab/payload-better-auth" { interface PayloadBetterAuthRegister { pluginOptions: typeof betterAuthPluginConfig } }': never
}

export type ResolvedBetterAuthInstance = PayloadBetterAuthRegister extends {
  pluginOptions: infer O extends BetterAuthPluginOptions
}
  ? InferBetterAuthInstance<O>
  : PayloadBetterAuthRegister extends { internal: true }
    ? // package-internal programs only (see register.internal.d.ts): our own
      // code types against the plugin's standard surface
      InferInternalBetterAuthInstance
    : BetterAuthNotRegistered

declare module 'payload' {
  export interface BasePayload {
    /**
     * The better-auth instance bound to this Payload instance, created by
     * the plugin's onInit: one instance per payload instance, same lifetime.
     *
     * Host-typed when the project fills the {@link PayloadBetterAuthRegister}
     * interface; a compile-time error otherwise.
     */
    betterAuth: ResolvedBetterAuthInstance
  }
}
