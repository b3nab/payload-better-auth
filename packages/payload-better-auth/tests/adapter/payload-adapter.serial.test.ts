import { numberIdTestSuite } from '@better-auth/test-utils/adapter'
import { describeAdapterSuite } from './adapter.harness.js'

describeAdapterSuite({
  name: 'Payload Adapter Tests (serial ids)',
  idType: 'serial',
  tests: [numberIdTestSuite()],
})
