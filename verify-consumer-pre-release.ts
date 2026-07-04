import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { MongoDBContainer } from '@testcontainers/mongodb'

const ROOT = process.cwd()
const PKG_DIR = path.join(ROOT, 'packages/payload-better-auth')
const DEMO_DIR = path.join(ROOT, 'apps/demo')
const TARBALL = path.join(PKG_DIR, 'release.tgz')

const sha256 = (file: string) =>
  existsSync(file)
    ? createHash('sha256').update(readFileSync(file)).digest('hex')
    : 'absent'

const run = (
  cmd: string,
  cwd: string = ROOT,
  env: Record<string, string> = {},
) => {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })
}

async function main() {
  const hashBefore = sha256(TARBALL)
  console.log(`release.tgz (before): ${hashBefore}`)

  // Build and pack the plugin to the fixed tarball path consumed by apps/demo.
  // pack applies publishConfig (exports -> dist) and files, so the demo
  // installs the exact artifact that pnpm publish would ship.
  run('pnpm --filter @b3nab/payload-better-auth build')
  run('pnpm pack --out release.tgz', PKG_DIR)

  const hashAfter = sha256(TARBALL)
  console.log(`\nrelease.tgz (before): ${hashBefore}`)
  console.log(`release.tgz (after):  ${hashAfter}`)
  console.log(
    hashBefore === hashAfter
      ? 'hash comparison: IDENTICAL'
      : 'hash comparison: DIFFERENT',
  )

  // Refresh the demo install so pnpm re-resolves the tarball content.
  run('pnpm install')

  run('pnpm typecheck', DEMO_DIR)

  // Regenerate import map and payload types from the installed artifact.
  // This also exercises the payload CLI loading the plugin through plain Node.
  run('pnpm sync', DEMO_DIR)

  // Consumer verification: FULL `next build` with both bundlers, exactly as a
  // consumer runs it. The page-data collection phase must run: bundler module
  // errors (e.g. Turbopack MODULE_UNPARSABLE) only surface when the compiled
  // chunks are instantiated there, not during compilation. Payload needs a
  // reachable MongoDB in that phase, so boot an ephemeral one via
  // testcontainers (same pattern as tests/fixtures/beforeAll.fixtures.ts).
  const memoryDB = await new MongoDBContainer('mongo:8').start()
  const DATABASE_URI = `${memoryDB.getConnectionString()}/verify-consumer?directConnection=true`

  try {
    rmSync(path.join(DEMO_DIR, '.next'), { recursive: true, force: true })
    run('pnpm exec next build', DEMO_DIR, { DATABASE_URI })

    rmSync(path.join(DEMO_DIR, '.next'), { recursive: true, force: true })
    run('pnpm exec next build --webpack', DEMO_DIR, { DATABASE_URI })
  } finally {
    await memoryDB.stop()
  }

  console.log('\nverify:pre-release PASSED')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
