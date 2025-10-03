/* eslint-disable no-console */
/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { beforeAllFixtures } from '../fixtures/beforeAll.fixtures'
import { afterAllFixtures } from '../fixtures/afterAll.fixtures'
import { getSuite } from '../fixtures/suite.ctx'

describe('Better Auth Collections', () => {
  beforeAll(beforeAllFixtures(), 1000*60)

  afterAll(afterAllFixtures())

  it('should verify that the better-auth user collection is available', async () => {
    const userCollection = getSuite().payload?.collections.user
    expect(userCollection).toBeDefined()
  })

  it('should verify that the better-auth account collection is available', async () => {
    const accountCollection = getSuite().payload?.collections.account
    expect(accountCollection).toBeDefined()
  })

  it('should verify that the better-auth session collection is available', async () => {
    const sessionCollection = getSuite().payload?.collections.session
    expect(sessionCollection).toBeDefined()
  })

  it('should verify that the better-auth verification collection is available', async () => {
    const verificationCollection = getSuite().payload?.collections.verification
    expect(verificationCollection).toBeDefined()
  })

  it('should verify that the better-auth plugins collections are available', async () => {
    // extract collections from better-auth
    const payloadCollections = Object.keys(
      getSuite().payload?.collections || {},
    )
    const betterAuthTables = Object.values(
      getSuite().betterAuthTables || {},
    ).map((table) => table.modelName)
    expect(payloadCollections).toEqual(expect.arrayContaining(betterAuthTables))
  })
})
