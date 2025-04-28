import { createMDX } from 'fumadocs-mdx/next'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { version } = require('../../packages/payload-better-auth/package.json')
// import packagePBA from '../../packages/payload-better-auth/package.json' assert {
//   type: 'json',
// }
// const { version } = packagePBA

const [major, minor, patch] = version.split('.')

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    latestVersion: `v${major}.${minor}.x`,
  },
  redirects: async () => {
    return [
      {
        source: '/docs',
        destination: '/docs/latest/introduction',
        permanent: false,
      },
    ]
  },
}

export default withMDX(config)
