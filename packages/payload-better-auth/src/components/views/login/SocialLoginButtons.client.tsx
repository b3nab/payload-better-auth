'use client'

import type React from 'react'
import { useBetterAuthClient } from '../../providers/BetterAuthProvider.client.js'
import { socialProviders } from '../../icons/social-provider.js'

export type SocialLoginButtonsProps = {
  providers: string[]
  adminRoute: string
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  providers,
  adminRoute,
}) => {
  const { betterAuthClient } = useBetterAuthClient()

  if (!providers || providers.length === 0) {
    return null
  }

  const handleSocialLogin = async (providerId: string) => {
    try {
      await betterAuthClient.signIn.social({
        provider: providerId as any,
        callbackURL: adminRoute,
      })
    } catch (error) {
      console.error(`Error signing in with ${providerId}:`, error)
    }
  }

  return (
    <div
      style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--theme-elevation-150)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{ flex: 1, height: '1px', background: 'var(--theme-elevation-150)' }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          or continue with
        </span>
        <div
          style={{ flex: 1, height: '1px', background: 'var(--theme-elevation-150)' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {providers.map((providerId) => {
          const providerConfig =
            socialProviders[providerId as keyof typeof socialProviders]
          const Icon = providerConfig?.Icon
          const label = providerId.charAt(0).toUpperCase() + providerId.slice(1)

          return (
            <button
              key={providerId}
              type="button"
              onClick={() => handleSocialLogin(providerId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                background: 'var(--theme-elevation-50)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--theme-elevation-800)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--theme-elevation-100)'
                e.currentTarget.style.borderColor = 'var(--theme-elevation-250)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--theme-elevation-50)'
                e.currentTarget.style.borderColor = 'var(--theme-elevation-150)'
              }}
            >
              {Icon && (
                <span style={{ fontSize: '1.25rem', display: 'flex' }}>
                  <Icon />
                </span>
              )}
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

