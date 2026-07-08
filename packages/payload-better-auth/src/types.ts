import type { CollectionConfig, CollectionSlug } from 'payload'
import type { BetterAuthOptions } from 'better-auth/minimal'
import type { BetterAuthPlugin } from 'better-auth'
import type { LoggerConfig } from './singleton.logger.js'
import type { InferInternalBetterAuthInstance } from './better-auth/instance.js'

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

declare module 'payload' {
  export interface BasePayload {
    /**
     * The better-auth instance bound to this Payload instance, created by
     * the plugin's onInit: one instance per payload instance, same lifetime.
     *
     * Typed with the default plugins only: module augmentation cannot be
     * generic over the host's plugin options, so the host-specific view
     * (host plugins included) lives behind createAuthLayer.
     */
    betterAuth: InferInternalBetterAuthInstance
  }
}
