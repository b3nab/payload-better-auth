'use client'
// marks the whole client entry as a client boundary for hosts that resolve
// the plugin from node_modules: payload's own @payloadcms/ui does the same on
// its client barrel. Without it, Next treats this external package as a server
// module and field components (e.g. TwoFactorAccountButton) get server-rendered,
// making client hooks like useConfig() return undefined.
// Named exports only: `export *` is rejected inside a client boundary by
// Next's flight loader ("unsupported to use export * in a client boundary").

// export { BeforeDashboardClient } from '../components/BeforeDashboardClient.js'

export {
  BetterAuthProvider,
  useBetterAuthClient,
} from '../components/providers/BetterAuthProvider.client.js'
export { FormsTwoFactor } from '../components/views/two-factor-setup/FormSetupTwoFactor.client.js'
export { FormVerifyTwoFactor } from '../components/views/two-factor-verify/FormVerifyTwoFactor.client.js'

// Account page 2FA button
export { TwoFactorAccountButton } from '../components/views/account/TwoFactorAccountButton.client.js'

// Login View - Social Login Buttons
export { SocialLoginButtons } from '../components/views/login/SocialLoginButtons.client.js'
