import path from 'path'
import { loadEnv } from 'payload/node'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { coverageConfigDefaults, defineConfig } from 'vitest/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig(() => {
  loadEnv(path.resolve(dirname, './dev'))

  return {
    // vite 8 honors the tsconfig `jsx: preserve` (required by Next for dev/)
    // and would leave the JSX in dev/lib/email/*.tsx untransformed; force the
    // test transformer to compile it.
    oxc: {
      jsx: {
        runtime: 'automatic' as const,
      },
    },
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    test: {
      environment: 'node',
      hookTimeout: 30_000,
      testTimeout: 30_000,
      deps: {
        optimizer: {
          ssr: {
            enabled: true,
            // bundle the heavy ESM trees once, cached across runs; entries
            // are the import specifiers actually used by the tests
            include: [
              'better-auth',
              'better-auth/minimal',
              'better-auth/adapters',
              'better-auth/api',
              'better-auth/db',
              'better-auth/plugins',
              'better-auth/next-js',
              '@better-auth/test-utils/adapter',
            ],
          },
        },
      },
      coverage: {
        include: ['src/**/*'],
        exclude: [
          './dev/**',
          '**.config.ts',
          'src/exports/**/*',
          'src/nextjs/**/*',
          'src/components/**/*',
          'src/payload-utilities/**/*',
          ...coverageConfigDefaults.exclude,
        ],
      },
    },
  }
})
