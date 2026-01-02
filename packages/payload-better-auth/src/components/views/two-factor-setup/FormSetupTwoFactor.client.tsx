'use client'

import type React from 'react'
import { useState } from 'react'
// import '../../index.css'

import {
  EmailField,
  Form,
  FormSubmit,
  PasswordField,
  TextField,
  toast,
  useAuth,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import type { FormState } from 'payload'
import { useBetterAuthClient } from '../../providers/BetterAuthProvider.client.js'
import { redirect } from 'next/navigation.js'
import { QRCode2FA } from './QRCode.client.js'

interface FormsTwoFactorProps {
  action: 'enable' | 'disable'
}

export const FormsTwoFactor: React.FC<FormsTwoFactorProps> = ({
  action: actionFromProps,
}) => {
  const [action, setAction] = useState<'enable' | 'disable'>(actionFromProps)
  const { config, getEntityConfig } = useConfig()

  const {
    admin: {
      routes: { forgot: forgotRoute },
      user: userSlug,
    },
    routes: { admin: adminRoute, api: apiRoute },
  } = config

  const { t } = useTranslation()

  const initialState: FormState = {
    password: {
      initialValue: '',
      valid: false,
      value: '',
    },
  }

  const [needVerification, setNeedVerification] = useState(false)
  const [qrCodeURI, setQrCodeURI] = useState<string | null>(null)

  const { setUser } = useAuth()
  const { betterAuthClient } = useBetterAuthClient()

  const submitTwoFactorEnable = async (data: FormState) => {
    console.log('[two-factor] [enable] data', data)
    const response = await betterAuthClient.twoFactor.enable({
      password: data.password.value as string,
    })
    console.log('response', response)
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
    } else {
      setNeedVerification(true)
      setQrCodeURI(response.data.totpURI)
      toast.success(
        'Two-Factor Authentication enabled. Please verify your TOTP code to complete the setup.',
      )
      setAction('disable')
    }
  }

  const submitTwoFactorDisable = async (data: FormState) => {
    console.log('[two-factor] [disable] data', data)
    const response = await betterAuthClient.twoFactor.disable({
      password: data.password.value as string,
    })
    console.log('response', response)
    toast.success('Two-Factor Authentication has been disabled')
    setAction('enable')
    redirect('/admin')
  }

  const submitTwoFactorVerify = async (data: FormState) => {
    console.log('[two-factor] [verify] data', data)
    const response = await betterAuthClient.twoFactor.verifyTotp({
      code: data.password.value as string,
    })
    console.log('response', response)
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
    } else {
      toast.success('Two-Factor Authentication verified successfully')
      try {
        // try to set the user, even here it could return response.data as a Blob the first time
        // but here we don't do the same workaround as the /two-factor-verify
        // the user will be set later by the /api/user/me call
        setUser({
          token: response.data.token,
          exp: 60 * 60 * 24, // 1 day if exp is in seconds
          user: {
            collection: 'user',
            ...response.data.user,
          },
        })
      } catch (error) {
        console.error('[two-factor] [1st-verify] [error]', error)
      }
      redirect('/admin')
    }
  }

  return (
    <>
      {!needVerification ? (
        <Form
          onSubmit={
            action === 'enable' ? submitTwoFactorEnable : submitTwoFactorDisable
          }
          initialState={initialState}
          method="POST"
        >
          <div className={'form-header'}>
            <h1>
              {action === 'enable'
                ? 'Enable Two-Factor Authentication'
                : 'Disable Two-Factor Authentication'}
            </h1>
            <p>
              {action === 'enable'
                ? 'Enter your password to enable Two-Factor Authentication (2FA). This will add an extra layer of security to your account and help prevent unauthorized access to the Admin Panel.'
                : 'Enter your password to disable Two-Factor Authentication (2FA). Disabling 2FA will reduce the security of your account and make it more vulnerable to unauthorized access.'}
            </p>
          </div>

          <PasswordField
            field={{
              name: 'password',
              label: t('general:password'),
              required: true,
            }}
            autoComplete="current-password"
            path="password"
          />

          <FormSubmit size="large">
            {action === 'enable' ? 'Enable' : 'Disable'}
            {/* {t('general:submit')} */}
          </FormSubmit>
        </Form>
      ) : (
        <div>
          <div className={'form-header'}>
            <h1>Complete Two-Factor Authentication Setup</h1>
            <p>
              Scan the QR code below with your authenticator app (such as Google Authenticator, Authy, or Microsoft Authenticator), then enter the verification code to complete the setup and secure your account.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QRCode2FA uri={qrCodeURI} />
          </div>

          <Form
            onSubmit={submitTwoFactorVerify}
            initialState={initialState}
            method="POST"
          >
            <PasswordField
              field={{
                name: 'password',
                label: 'Code',
                required: true,
              }}
              autoComplete="one-time-code"
              path="password"
            />

            <FormSubmit size="large">{t('general:submit')}</FormSubmit>
          </Form>
        </div>
      )}
    </>
  )
}
