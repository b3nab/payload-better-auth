/**
 * Compile-scoped internal registration. This declaration file enters the
 * package programs only through tsconfig `include`: it is never imported,
 * and neither tsc (input declaration files are not re-emitted) nor copyfiles
 * ship it to dist, so host programs never see it.
 *
 * Inside the package it marks the registry so that `payload.betterAuth`
 * used by our own code (endpoints, strategy, nextjs layer) resolves to the
 * internal base type instead of the not-registered error. A host
 * `pluginOptions` registration, when present in the same program (dev),
 * wins over this marker.
 */
import type {} from './types.js'

declare module './types.js' {
  interface PayloadBetterAuthRegister {
    internal: true
  }
}
