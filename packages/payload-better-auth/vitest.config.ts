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
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    test: {
      environment: 'node',
      hookTimeout: 30_000,
      testTimeout: 30_000,
      coverage: {
        include: [
          "src/**/*"
        ],
        exclude: [
          "./dev/**",
          "**.config.ts",
          "src/exports/**/*",
          "src/nextjs/**/*",
          "src/components/**/*",
          "src/payload-utilities/**/*",
          ...coverageConfigDefaults.exclude
        ]
      }
    },
  }
})