// @ts-nocheck
'use server'

import type React from 'react'
import type { Payload, AdminViewProps } from 'payload'

import { MinimalTemplate } from '@payloadcms/next/templates'
import { Button, Gutter, Logout } from '@payloadcms/ui'
import { redirect } from 'next/navigation.js'
import { FormVerifyTwoFactor } from '../../two-factor/FormVerifyTwoFactor.client.js'
import { formatAdminURL } from '@payloadcms/ui/shared'

type AdminViewServerProps = AdminViewProps & {
  payload: Payload
}

export const VerifyTwoFactorServer: React.FC<AdminViewServerProps> = async ({
  initPageResult,
  params,
  searchParams,
  payload,
}) => {
  const { cookies } = initPageResult
  const twoFactorSession = cookies.get('better-auth.two_factor')
  console.log('twoFactorSession', twoFactorSession)

  // const twoFactorEnabled = user?.twoFactorEnabled || false

  if (!twoFactorSession) {
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
        <FormVerifyTwoFactor />
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Logout />
        </div>
        {/* <Button
          size="large"
          buttonStyle="secondary"
          el="anchor"
          url={formatAdminURL({
            adminRoute: payload.config.routes.admin,
            path: '/logout',
          })}
        >
          Logout
        </Button> */}
      </Gutter>
    </MinimalTemplate>
  )
}
