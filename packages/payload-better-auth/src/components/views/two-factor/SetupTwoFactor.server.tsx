// @ts-nocheck
'use server'

import type React from 'react'
import type { Payload, AdminViewProps } from 'payload'

import { MinimalTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { FormsTwoFactor } from '../../two-factor/FormSetupTwoFactor.client.js'
import { redirect } from 'next/navigation.js'

type AdminViewServerProps = AdminViewProps & {
  payload: Payload
}

export const SetupTwoFactorServer: React.FC<AdminViewServerProps> = async ({
  initPageResult,
  params,
  searchParams,
  payload,
}) => {
  const user = initPageResult.req.user || undefined
  console.log('user', user)

  const twoFactorEnabled = user?.twoFactorEnabled || false

  if (!user) {
    redirect('/admin')
  }

  return (
    <MinimalTemplate
      className="login"
      // i18n={initPageResult.req.i18n}
      // locale={initPageResult.locale}
      // params={params}
      // payload={initPageResult.req.payload}
      // permissions={initPageResult.permissions}
      // searchParams={searchParams}
      // user={initPageResult.req.user || undefined}
      // visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <FormsTwoFactor action={twoFactorEnabled ? 'disable' : 'enable'} />
      </Gutter>
    </MinimalTemplate>
  )
}
