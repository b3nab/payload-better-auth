import { getSuite, clearSuite } from './suite.ctx.js'

export const afterAllFixtures = () => async () => {
  await clearSuite()
}
