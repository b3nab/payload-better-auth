'use client'
import type React from 'react'
import { createContext, useContext, useEffect } from 'react'
import type { Payload } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import { usePathname, useRouter } from 'next/navigation.js'
import { useAuth } from '@payloadcms/ui'
import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/plugins'
import { passkeyClient } from 'better-auth/client/plugins'
import type { BetterAuthClientPlugin } from 'better-auth/types'
import type { BetterAuthPluginOptions } from '../../index.js'

// Types imported just to make the types work
import type * as nanostores from 'nanostores'
import type * as simplewebauthn from '@simplewebauthn/server'
import type * as betterauthserverplugins from 'better-auth/plugins'

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
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log('[client] [CheckAuthFlows] useEffect::', pathname)
    const isVerifyTwoFactorPage = pathname.includes(
      authFlows.twoFactor.redirectUrl,
    )

    // if (pathname.includes('/logout')) {
    //   // FIX! this is a hack to refresh the logout page since at first sight there is an issue:
    //   // PayloadCMS has a client hook useAuth() that has logOut function wrapped in a useCallback
    //   // and this useCallback is not updated when the page is refreshed
    //   // probably because of a conflict with the latest update of PayloadCMS v3.24.0 that uses reactTransition
    //   // so we need to refresh the page to get it to call the logOut function and retrieve the Set-Cookie
    //   // that contains the expired cookies set by the logout endpoint
    //   console.warn(
    //     '[client] [CheckAuthFlows] [useEffect] [logout] [refreshing]',
    //   )
    //   router.refresh()
    // }

    if (
      user?.id === 'two-factor-id' &&
      authFlows.twoFactor.enabled &&
      !isVerifyTwoFactorPage &&
      !pathname.includes('/logout')
    ) {
      // window.location.href = authFlows.twoFactor.redirectUrl
      router.push(authFlows.twoFactor.redirectUrl)
    }
  }, [authFlows, pathname, router, user])

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
