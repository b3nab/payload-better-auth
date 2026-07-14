// @ts-nocheck
'use server'

import type React from 'react'
import type { Payload, AdminViewProps } from 'payload'

import { MinimalTemplate } from '@payloadcms/next/templates'
import { Button, Gutter, Logout } from '@payloadcms/ui'
import { redirect } from 'next/navigation.js'
import { FormVerifyTwoFactor } from './FormVerifyTwoFactor.client.js'
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
  const { betterAuth, config } = initPageResult.req.payload
  // the runtime cookie name carries deploy-dependent prefixes (__Secure- on
  // https, a custom cookiePrefix): resolve it from the same better-auth
  // context that set the cookie instead of hardcoding 'better-auth.two_factor'
  const authContext = await betterAuth.$context
  const twoFactorSession = cookies.get(
    authContext.createAuthCookie('two_factor').name,
  )
  console.log('twoFactorSession', twoFactorSession)

  // const twoFactorEnabled = user?.twoFactorEnabled || false

  if (!twoFactorSession) {
    redirect(config.routes.admin)
  }

  // the otp flow is server-driven: offer it only when the host configured a
  // sender on the two-factor plugin
  const otpAvailable = Boolean(
    authContext.getPlugin('two-factor')?.options?.otpOptions?.sendOTP,
  )

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
        <FormVerifyTwoFactor otpAvailable={otpAvailable} />
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
