import { getSuite, clearSuite } from './suite.ctx'

export const afterAllFixtures = () => async () => {
  const suite = getSuite()

  if (suite?.payload.destroy) {
    await suite.payload.destroy()
  }

  if (suite?.memoryDB) {
    suite.memoryDB.close()
  }

  if (suite?.betterAuth) {
    // @ts-expect-error
    suite.betterAuth = undefined
  }

  clearSuite()
}
