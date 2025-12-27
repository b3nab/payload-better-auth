import type { CollectionConfig, CollectionSlug } from 'payload'
import type { BetterAuthOptions } from 'better-auth/minimal'
import type { LoggerConfig } from './singleton.logger.js'

export type CollectionConfigExtend<T extends CollectionSlug> = Omit<
  CollectionConfig<T>,
  'slug'
>

export type BetterAuthPluginOptions = Readonly<{
  /**
   * Better Auth Config. https://www.better-auth.com/docs/reference/options
   * This config will override the default ones from the plugin itself.
   */
  betterAuth?: Omit<BetterAuthOptions, 'database'>

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
