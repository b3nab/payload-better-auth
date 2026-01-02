'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useAuth, Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation.js'

interface TwoFactorSetupPromptProps {
  enabled: boolean
  setupUrl: string
}

const STORAGE_KEY = 'pba-2fa-dismis'

export const TwoFactorSetupPrompt: React.FC<TwoFactorSetupPromptProps> = ({
  enabled,
  setupUrl,
}) => {
  const [showPrompt, setShowPrompt] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only show if:
    // 1. 2FA plugin is enabled
    // 2. User hasn't enabled 2FA yet
    // 4. User hasn't dismissed this prompt in this session
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true' || sessionStorage.getItem(STORAGE_KEY) === 'true'

    if (
      enabled &&
      !user?.twoFactorEnabled &&
      !isDismissed
    ) {
      setShowPrompt(true)
    }
  }, [enabled, user])

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setShowPrompt(false)
    toast.info('You can setup 2FA anytime from the cms account page')
  }

  const handleSetup = () => {
    router.push(setupUrl)
  }

  const handleNeverShow = () => {
    // Store in localStorage to persist across sessions
    localStorage.setItem(STORAGE_KEY, 'true')
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--theme-elevation-0)',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              color: 'var(--theme-text)',
            }}
          >
            Secure Your Account
          </h2>
        </div>

        <p
          style={{
            color: 'var(--theme-elevation-800)',
            textAlign: 'center',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          We strongly recommend enabling{' '}
          <strong>Two-Factor Authentication (2FA)</strong> to add an extra layer
          of security to your account and prevent unauthorized access to Admin Panel.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Button onClick={handleSetup} size="large">
            Setup 2FA Now
          </Button>
          <Button buttonStyle="secondary" onClick={handleDismiss} size="large">
            Remind Me Later
          </Button>
          <button
            onClick={handleNeverShow}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-elevation-500)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              padding: '0.5rem',
            }}
          >
            Don&apos;t show this again
          </button>
        </div>
      </div>
    </div>
  )
}

