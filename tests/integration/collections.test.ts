/* eslint-disable no-console */
/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */
import type { Payload } from 'payload'
import type { betterAuth } from 'better-auth'
import type { MongoMemoryReplSet } from 'mongodb-memory-server'
import type { NextRESTClient } from '../../dev/helpers/NextRESTClient.js'

import { beforeAllFixtures } from '../fixtures/beforeAll.fixtures.js'
import { afterAllFixtures } from '../fixtures/afterAll.fixtures.js'
import type { getAuthTables } from 'better-auth/db'
import { getSuite } from '../fixtures/suite.ctx.js'

describe('Better Auth Collections', () => {
  beforeAll(beforeAllFixtures())

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
