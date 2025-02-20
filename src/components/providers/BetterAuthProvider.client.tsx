'use client'
import type React from 'react'
import { createContext, useContext, useEffect } from 'react'
import { createAuthClient } from 'better-auth/react'
import type { BetterAuthPluginOptions } from '../../index.js'
import { twoFactorClient } from 'better-auth/plugins'
import { passkeyClient } from 'better-auth/plugins/passkey'
import type { BetterAuthClientPlugin } from 'better-auth/types'

// Types imported just to make the types work
import type * as nanostores from 'nanostores'
import type * as simplewebauthn from '@simplewebauthn/server'
import type { Payload } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import { usePathname, useRouter } from 'next/navigation.js'

function generateBetterAuthClient(pluginOptions: BetterAuthPluginOptions) {
  const clientPlugins = []
  clientPlugins.push(twoFactorClient())
  if (pluginOptions.betterAuthPlugins?.passkey) {
    clientPlugins.push(passkeyClient())
  }
  return createAuthClient<{
    plugins: typeof clientPlugins
  }>({ plugins: clientPlugins })
}

interface BetterAuthClientContextType {
  betterAuthClient: ReturnType<typeof generateBetterAuthClient>
}

const BetterAuthClientContext = createContext<
  BetterAuthClientContextType | undefined
>(undefined)

interface BetterAuthProviderProps {
  children: React.ReactNode
  pluginOptions: BetterAuthPluginOptions
  // payloadConfig: Payload
  authFlows: {
    twoFactor: {
      enabled: boolean
      redirectUrl: string
    }
  }
}

export const BetterAuthProvider: React.FC<BetterAuthProviderProps> = ({
  children,
  // payloadConfig,
  pluginOptions,
  authFlows,
}) => {
  // const router = useRouter()
  console.log('[PROVIDER] [BetterAuthProvider]')

  // checkFlows(authFlows, { router, payloadConfig })

  const betterAuthClient = generateBetterAuthClient(pluginOptions)

  return (
    <BetterAuthClientContext.Provider value={{ betterAuthClient }}>
      <CheckAuthFlows authFlows={authFlows} />
      {children}
    </BetterAuthClientContext.Provider>
  )
}

export function useBetterAuthClient() {
  const context = useContext(BetterAuthClientContext)
  if (!context) {
    throw new Error(
      'useBetterAuthClient must be used within a BetterAuthProvider',
    )
  }
  return context
}

// AUTH FLOWS on client

const CheckAuthFlows = ({
  authFlows,
}: { authFlows: BetterAuthProviderProps['authFlows'] }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('[client] [CheckAuthFlows] useEffect::', pathname)
    const isVerifyTwoFactorPage = pathname.includes(
      authFlows.twoFactor.redirectUrl,
    )

    if (authFlows.twoFactor.enabled && !isVerifyTwoFactorPage) {
      window.location.href = authFlows.twoFactor.redirectUrl
      // router.push(authFlows.twoFactor.redirectUrl)
    }
  }, [authFlows, pathname, router])

  return null
}

// function checkFlows(
//   authFlows: BetterAuthProviderProps['authFlows'],
//   extra: { router: NextRouter; payloadConfig: Payload },
// ) {
//   const { router, payloadConfig } = extra
//   if (authFlows.twoFactor.enabled) {
//     console.log(
//       '[client] [BetterAuthProvider] [authFlows] [twoFactor] [enabled]',
//     )

//     const verifyTwoFactorPath = formatAdminURL({
//       adminRoute: payloadConfig.config.routes.admin,
//       path: '/two-factor-verify',
//     })

//     // get current path
//     const currentPath = router.pathname
//     const isVerifyTwoFactorPage = currentPath.includes(verifyTwoFactorPath)

//     if (!isVerifyTwoFactorPage) {
//       // nextjs client redirect
//       router.push(verifyTwoFactorPath)
//     }
//   }
// }
