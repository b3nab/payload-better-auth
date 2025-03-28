/* eslint-disable no-console */
/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */
import { beforeAllFixtures } from '../fixtures/beforeAll.fixtures.js'
import { afterAllFixtures } from '../fixtures/afterAll.fixtures.js'
import { getSuite } from '../fixtures/suite.ctx.js'

describe('Better Auth API', () => {
  beforeAll(beforeAllFixtures())

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
      if (typeof endpoint.method === 'string') {
        acc.push({
          path: `/auth${endpoint.path}`,
          method: endpoint.method.toLowerCase(),
        })
      }
      if (typeof endpoint.method === 'object') {
        for (const method of endpoint.method) {
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
