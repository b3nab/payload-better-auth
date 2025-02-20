'use client'

import { useState, type FC } from 'react'

import {
  EmailField,
  Form,
  FormSubmit,
  PasswordField,
  TextField,
  toast,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import type { FormState } from 'payload'
import { useBetterAuthClient } from '../providers/BetterAuthProvider.client.js'
import { redirect } from 'next/navigation.js'

export const FormVerifyTwoFactor: FC = () => {
  // const { config, getEntityConfig } = useConfig()
  // const {
  //   admin: {
  //     routes: { forgot: forgotRoute },
  //     user: userSlug,
  //   },
  //   routes: { admin: adminRoute, api: apiRoute },
  // } = config
  const { t } = useTranslation()

  const initialState: FormState = {
    password: {
      initialValue: '',
      valid: false,
      value: '',
    },
  }

  const { betterAuthClient } = useBetterAuthClient()

  const submitTwoFactorVerify = async (data: FormState) => {
    console.log('[two-factor] [verify] data', data)
    const response = await betterAuthClient.twoFactor.verifyTotp({
      code: data.password.value as string,
    })
    console.log('response', response)
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
    } else {
      toast.success('Two factor authentication verified')
      redirect('/admin')
    }
  }

  return (
    <>
      <div>
        <div className={'form-header'}>
          <h1>Verify 2FA</h1>
          <p>
            Enter the code from your authenticator app to verify your account
          </p>
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
    </>
  )
}
