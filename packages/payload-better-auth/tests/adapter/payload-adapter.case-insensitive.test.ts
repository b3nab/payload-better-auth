import { caseInsensitiveTestSuite } from '@better-auth/test-utils/adapter'
import { describeAdapterSuite } from './adapter.harness.js'

describeAdapterSuite({
  name: 'Payload Adapter Tests (case insensitive)',
  idType: 'uuid',
  tests: [
    caseInsensitiveTestSuite({
      disableTests: {
        // Payload normalizes emails at WRITE time on auth collections
        // (auth baseField email: beforeValidate -> value.toLowerCase().trim())
        // by design, so the original casing never reaches the store and the
        // mixed-case roundtrip these two tests assert cannot hold. The query
        // semantics are correct (eq sensitive = equals, eq insensitive =
        // like prefilter + exact js check) — the limit is the stored datum.
        // Upstream is converging on the same normalization:
        // - https://github.com/better-auth/better-auth/issues/10276
        //   (mixed-case stored emails break sign-in)
        // - https://github.com/better-auth/better-auth/issues/10296
        //   (case-insensitive lookups as workaround for mixed-case stores)
        // - https://github.com/better-auth/better-auth/issues/8651
        //   (email-otp normalizes .trim().toLowerCase() across endpoints)
        'findOne - eq with mode insensitive should match regardless of case': true,
        'findOne - eq with mode sensitive (default) should not match different case': true,
      },
    }),
  ],
})
