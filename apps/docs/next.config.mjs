import { createMDX } from 'fumadocs-mdx/next'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { version } = require('../../packages/payload-better-auth/package.json')
// import packagePBA from '../../packages/payload-better-auth/package.json' assert {
//   type: 'json',
// }
// const { version } = packagePBA

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    latestVersion: `v${version}`,
  },
  redirects: async () => {
    return [
      {
        source: '/docs',
        destination: '/docs/latest/introduction',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
