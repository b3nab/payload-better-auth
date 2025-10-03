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

describe('Better Auth API', () => {
  beforeAll(beforeAllFixtures(), 1000*60)

  afterAll(afterAllFixtures())

  it('should verify that the better-auth API endpoints are available', async () => {
    const payloadEndpoints = Object.values(
      getSuite().payload.config.endpoints || {},
    ).map((endpoint) => ({
      path: endpoint.path,
      method: endpoint.method,
    }))

    const betterAuthEndpoints = Object.values(
      getSuite().betterAuthEndpoints.api || {},
    ).reduce((acc: any[], endpoint) => {
      if ("method" in endpoint && typeof endpoint.method === 'string') {
        acc.push({
          path: `/auth${endpoint.path}`,
          method: endpoint.method.toLowerCase(),
        })
      }
      if ("method" in endpoint && typeof endpoint.method === 'object') {
        for (const method of endpoint.method as string[]) {
          acc.push({
            path: `/auth${endpoint.path}`,
            method: method.toLowerCase(),
          })
        }
      }
      return acc
    }, [])

    expect(payloadEndpoints).toEqual(
      expect.arrayContaining(betterAuthEndpoints),
    )
  })
})
