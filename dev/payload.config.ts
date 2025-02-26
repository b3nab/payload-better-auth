import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  betterAuthPlugin,
  type BetterAuthPluginOptions,
} from 'payload-better-auth'

import { devUser } from './helpers/credentials.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export const betterAuthPluginConfig = {
  betterAuth: {},
  // betterAuthPlugins: {
  //   twoFactor: true,
  // },
  logs: 'trace',
} satisfies BetterAuthPluginOptions

export default buildConfig({
  cors: ['http://authdemo.local:3000'],
  admin: {
    // autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'posts',
      fields: [],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  // onInit: async (payload) => {
  //   await seed(payload)
  // },
  plugins: [betterAuthPlugin(betterAuthPluginConfig)],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
