import { getSuite, clearSuite } from './suite.ctx'

export const afterAllFixtures = () => async () => {
  const suite = getSuite()

  if (suite?.payload.db.destroy) {
    await suite.payload.db.destroy()
  }

  if (suite?.memoryDB) {
    await suite.memoryDB.stop()
    // await suite.memoryDB.client.close()
  }

  clearSuite()
}
