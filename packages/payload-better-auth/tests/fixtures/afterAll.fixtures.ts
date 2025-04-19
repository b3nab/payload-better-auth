import { getSuite, clearSuite } from './suite.ctx'

export const afterAllFixtures = () => async () => {
  const suite = getSuite()

  if (suite?.payload.db.destroy) {
    await suite.payload.db.destroy()
  }

  if (suite?.memoryDB) {
    await suite.memoryDB.stop({
      force: true,
    })
  }

  if (suite?.betterAuth) {
    // @ts-expect-error
    suite.betterAuth = undefined
  }

  clearSuite()
}
