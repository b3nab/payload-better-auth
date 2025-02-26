import type { NextServerOptions } from 'next/dist/server/next.js'

import path from 'node:path'
import { createServer } from 'node:http'
import { fileURLToPath, parse } from 'node:url'
import next from 'next'
import open from 'open'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const opts: NextServerOptions = {
  dev: true,
  dir: dirname,
}

// @ts-expect-error next types do not import
const app = next(opts)
const handle = app.getRequestHandler()

await app.prepare()

await open(
  `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/admin`,
)

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true)
  void handle(req, res, parsedUrl)
})

server.listen(3000)
