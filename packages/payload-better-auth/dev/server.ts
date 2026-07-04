import type { NextServerOptions } from 'next/dist/server/next.js'

import path from 'node:path'
import { createServer } from 'node:http'
import { fileURLToPath, parse } from 'node:url'
import next from 'next'
import open from 'open'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const DEV_PORT = 7125

console.log(`DEV_PORT is ${DEV_PORT}`)

const opts: NextServerOptions & { webpack?: boolean } = {
  dev: true,
  dir: dirname,
  port: DEV_PORT,
  // Next 16 defaults to Turbopack, which cannot resolve the NodeNext-style
  // relative `.js` imports in our TS source (vercel/next.js#82945). Webpack
  // handles them via resolve.extensionAlias in next.config.mjs.
  webpack: true,
}

const app = next(opts)
const handle = app.getRequestHandler()

await app.prepare()

await open(
  `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:7125'}/admin`,
)

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true)
  void handle(req, res, parsedUrl)
})

server.listen(DEV_PORT, () => {
  console.log(`🚀 Server running on http://localhost:${DEV_PORT}`)
  console.log(`📱 Admin panel: http://localhost:${DEV_PORT}/admin`)
})
