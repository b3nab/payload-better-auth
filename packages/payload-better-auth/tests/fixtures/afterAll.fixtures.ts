import { getSuite, clearSuite } from './suite.ctx'

export const afterAllFixtures = () => async () => {
  await clearSuite()
}
