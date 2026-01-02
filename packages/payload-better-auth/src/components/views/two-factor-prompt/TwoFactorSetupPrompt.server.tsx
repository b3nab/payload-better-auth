'use server'

import type React from 'react'
import type { Payload, ServerComponentProps } from 'payload'
import { formatAdminURL } from '@payloadcms/ui/shared'
import { TwoFactorSetupPrompt } from './TwoFactorSetupPrompt.client.js'

type TwoFactorSetupPromptServerProps = ServerComponentProps & {
  payload: Payload
}

export const TwoFactorSetupPromptServer: React.FC<
  TwoFactorSetupPromptServerProps
> = async ({ payload }) => {
  const twoFactorEnabled = payload.config.custom?.authFlows?.twoFactor ?? false
  const setupUrl = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: '/two-factor-setup',
  })

  return <TwoFactorSetupPrompt enabled={twoFactorEnabled} setupUrl={setupUrl} />
}

