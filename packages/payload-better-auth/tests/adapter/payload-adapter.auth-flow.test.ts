import { authFlowTestSuite } from '@better-auth/test-utils/adapter'
import { describeAdapterSuite } from './adapter.harness.js'

describeAdapterSuite({
  name: 'Payload Adapter Tests (auth flow)',
  idType: 'uuid',
  tests: [authFlowTestSuite()],
})
