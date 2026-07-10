import { describe, beforeAll, afterAll } from 'vitest'
import { testAdapter } from '@better-auth/test-utils/adapter'
import { payloadAdapter } from '../../src/better-auth/payload-adapter.js'
import { beforeAllFixtures } from '../fixtures/beforeAll.fixtures.js'
import { afterAllFixtures } from '../fixtures/afterAll.fixtures.js'
import { bootSuite, getSuite, hasSuite } from '../fixtures/suite.ctx.js'
import { initLogger } from '../../src/singleton.logger.js'

// normally the plugin initializes the logger at config build; the adapter is
// tested here without the plugin bootstrap, and testAdapter builds it eagerly
initLogger({ level: 'error' })

type TestAdapterArgs = Parameters<typeof testAdapter>[0]
type PayloadAdapterFactory = ReturnType<typeof payloadAdapter>
type PayloadDBAdapter = ReturnType<PayloadAdapterFactory>

// testAdapter creates a throwaway adapter at collection time, before the
// suite payload boots, and reads only these two properties from it (for the
// describe label); keep in sync with the payloadAdapter factory config
const PREBOOT_ANSWERS: Pick<PayloadDBAdapter, 'id' | 'options'> = {
  id: 'payloadcms',
  options: {
    adapterConfig: { adapterId: 'payloadcms', adapterName: 'PayloadCMS' },
  },
}

/**
 * One describe = one payload boot: the id shape of every collection is
 * decided by the db adapter at init, so each idType needs its own instance.
 * Vitest isolates test files in their own process, so each file calling this
 * gets its own postgres container and payload boot, and they run in parallel.
 */
export const describeAdapterSuite = ({
  name,
  idType,
  tests,
}: {
  name: string
  idType: 'serial' | 'uuid'
  tests: TestAdapterArgs['tests']
}) => {
  // one reusable container per file: reuse matches on configuration
  const dbName = `pba-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

  describe(name, async () => {
    // 2 minutes: a cold start may need to pull the postgres image
    beforeAll(
      beforeAllFixtures({ idType, boot: 'adapter', dbName }),
      1000 * 120,
    )

    afterAll(afterAllFixtures())

    const { execute } = await testAdapter({
      adapter: () => (options) => {
        if (!hasSuite()) return PREBOOT_ANSWERS as PayloadDBAdapter
        const instance = payloadAdapter({
          payload: getSuite().payload,
          debugLogs: { isRunningAdapterTests: true },
        })(options)
        // test-utils nulls `transaction` on the instance to relocate it into a
        // factory config (create-test-suite); on a fresh-per-op adapter like ours
        // the re-capture then reads the nulled value and better-auth falls back to
        // a non-transactional impl. Our transaction is bound to the payload, not to
        // this ephemeral instance, so keep it pinned against that null.
        const realTransaction = instance.transaction
        Object.defineProperty(instance, 'transaction', {
          configurable: true,
          get: () => realTransaction,
          set: () => {},
        })
        return instance
      },
      // migrations are handled by Payload itself (drop + push on boot, with
      // the plugin generating the collections), never by better-auth. A
      // migration IS a boot: the previous world dies (pool included) and a
      // fresh payload rises with the new options
      runMigrations: async (betterAuthOptions) => {
        await bootSuite({ idType, betterAuthOptions })
      },
      tests,
    })

    execute()
  })
}
