'use client'

import type React from 'react'
import { Button, useAuth, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation.js'
import { formatAdminURL } from '@payloadcms/ui/shared'

export const TwoFactorAccountButton: React.FC = () => {
  const { user } = useAuth()
  const { config } = useConfig()
  const { id: documentId } = useDocumentInfo()
  const router = useRouter()

  // Only show when user is viewing their OWN account, not editing another user
  const isOwnAccount = user?.id === documentId
  if (!isOwnAccount || !user) {
    return null
  }

  const hasTwoFactor = (user as any)?.twoFactorEnabled ?? false

  const setupUrl = formatAdminURL({
    adminRoute: config.routes.admin,
    path: '/two-factor-setup',
  })

  return (
    <div
      style={{
        // marginBottom: '1rem',
        // padding: '1rem',
        // backgroundColor: 'var(--theme-elevation-50)',
        borderRadius: '4px',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{hasTwoFactor ? '🔒' : '🔓'}</span>
        <span>
          {hasTwoFactor
            ? 'Two-Factor Authentication is enabled'
            : 'Two-Factor Authentication'}
        </span>
      </div>
      <Button
        // buttonStyle={hasTwoFactor ? 'secondary' : 'primary'}
        size="medium"
        onClick={() => router.push(setupUrl)}
      >
        {hasTwoFactor ? 'Manage 2FA' : 'Setup 2FA'}
      </Button>
    </div>
  )
}

