import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { devUser } from './helpers/credentials'
import { testEmailAdapter } from './helpers/testEmailAdapter'
// import { seed } from './seed'
import { betterAuthPluginConfig } from './payload-better-auth.config'
import { betterAuthPlugin } from '@b3nab/payload-better-auth'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export const buildDevConfig = (overrides?: { idType?: 'serial' | 'uuid' }) =>
  buildConfig({
  cors: [process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://authdemo.local:7125'],
  admin: {
    // autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  db: postgresAdapter({
    // Postgres-specific arguments go here.
    // `pool` is required.
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // serial vs uuid decide the id shape of every collection; the adapter
    // tests boot one payload per shape
    idType: overrides?.idType ?? 'uuid',
    // blocksAsJSON: true,
  }),
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI || '',
  // }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  // onInit: async (payload) => {
  //   await seed(payload)
  // },
  plugins: [betterAuthPlugin(betterAuthPluginConfig)],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // sharp,
  typescript: {
    // init()/reload() spawn a `payload generate:types` child that hangs forever
    // in findConfig (payloadcms/payload#15553); dev:sync generates types explicitly
    autoGenerate: false,
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

export default buildDevConfig()
