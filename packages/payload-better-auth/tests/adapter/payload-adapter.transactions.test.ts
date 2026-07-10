import { transactionsTestSuite } from '@better-auth/test-utils/adapter'
import { describeAdapterSuite } from './adapter.harness.js'

describeAdapterSuite({
  name: 'Payload Adapter Tests (transactions)',
  idType: 'uuid',
  tests: [transactionsTestSuite()],
})
