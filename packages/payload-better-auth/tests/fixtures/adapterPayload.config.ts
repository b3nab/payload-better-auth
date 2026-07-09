import type { BetterAuthOptions } from 'better-auth'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { betterAuthPlugin } from '../../src/plugin.js'

/**
 * Payload config for the adapter tests: base + THE PLUGIN, installed exactly
 * as a consumer would, with the harness's current better-auth options. The
 * plugin is what generates collections and endpoints — the tests exercise
 * the production path, never a replica of it. Admin and graphQL stay off:
 * the adapter contract only needs the Local API, everything else is boot
 * time.
 */
export const buildAdapterPayloadConfig = ({
  idType,
  betterAuthOptions,
}: {
  idType: 'serial' | 'uuid'
  betterAuthOptions: BetterAuthOptions
}) =>
  buildConfig({
    admin: { disable: true },
    graphQL: { disable: true },
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URI },
      idType,
    }),
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    plugins: [
      betterAuthPlugin({ betterAuth: betterAuthOptions, logs: 'error' }),
    ],
    // reload() spawns `payload generate:types` on every call unless disabled
    typescript: { autoGenerate: false },
  })

/**
 * pushDevSchema memoizes the last pushed shape at module level and skips
 * silently when it matches: the push must always run here. The database is
 * dropped first so the push never has a diff to reason about: drizzle-kit
 * prompts interactively (and a non-TTY run dies on it) not only on data
 * loss but also on create-vs-rename column ambiguity, which fires on empty
 * tables too whenever a suite renames a field between groups (e.g.
 * test_field -> custom_field). Data never survives a migration anyway: the
 * harness reseeds per test.
 */
export const withForcedPush = async <T>(run: () => Promise<T>): Promise<T> => {
  const previousDrop = process.env.PAYLOAD_DROP_DATABASE
  const previousForce = process.env.PAYLOAD_FORCE_DRIZZLE_PUSH
  process.env.PAYLOAD_DROP_DATABASE = 'true'
  process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = 'true'
  try {
    return await run()
  } finally {
    if (previousDrop === undefined) {
      delete process.env.PAYLOAD_DROP_DATABASE
    } else {
      process.env.PAYLOAD_DROP_DATABASE = previousDrop
    }
    if (previousForce === undefined) {
      delete process.env.PAYLOAD_FORCE_DRIZZLE_PUSH
    } else {
      process.env.PAYLOAD_FORCE_DRIZZLE_PUSH = previousForce
    }
  }
}
