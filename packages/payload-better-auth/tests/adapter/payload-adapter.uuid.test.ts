import { uuidTestSuite } from '@better-auth/test-utils/adapter'
import { describeAdapterSuite } from './adapter.harness.js'

describeAdapterSuite({
  name: 'Payload Adapter Tests (uuid ids)',
  idType: 'uuid',
  tests: [uuidTestSuite()],
})
