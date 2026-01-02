'use server'

import type React from 'react'
import type { ServerComponentProps } from 'payload'
import { SocialLoginButtons } from './SocialLoginButtons.client.js'

interface SocialLoginButtonsServerProps extends ServerComponentProps {
  socialProviders: string[]
  adminRoute: string
}

/**
 * Server component that extracts social provider configuration from Better Auth options
 * and passes it to the client component for rendering social login buttons
 */
export const SocialLoginButtonsServer: React.FC<SocialLoginButtonsServerProps> = async ({
  socialProviders,
  adminRoute,
}) => {
  if (socialProviders.length === 0) {
    return null
  }

  return <SocialLoginButtons providers={socialProviders} adminRoute={adminRoute} />
}

