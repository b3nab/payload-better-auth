'use client'

import type React from 'react'

import {
  EmailField,
  Form,
  FormSubmit,
  TextField,
  toast,
  useAuth,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import type { FormState } from 'payload'
import { useBetterAuthClient } from '../../providers/BetterAuthProvider.client.js'

export const FormVerifyTwoFactor: React.FC = () => {
  const { config, getEntityConfig } = useConfig()
  const {
    admin: {
      //     routes: { forgot: forgotRoute },
      user: userSlug,
    },
    //   routes: { admin: adminRoute, api: apiRoute },
  } = config
  const { t } = useTranslation()

  const initialState: FormState = {
    otp: {
      initialValue: '',
      valid: false,
      value: '',
    },
  }

  const { betterAuthClient } = useBetterAuthClient()
  const { setUser } = useAuth()

  const submitTwoFactorVerify = async (data: FormState) => {
    console.log('[two-factor] [verify] data', data)

    // TODO: FIX:
    /**
     * UGLY WORKAROUND FOR BETTER AUTH verifyTotp
     * The first time it returns a corrupted response.data in a Blob format (probably because it's malformed and it's improperly seen as Blob).
     * The second time it returns the correct response with data or error as stated by better-auth docs.
     * This workaround makes the api call to verifyTotp a recursive function by setting the max recursion with `const maxRecurs = 1` (keep in mind that 1 means 1 recursion so 1st standard execution + 1 real recursion)
     * Maybe it's a problem with the better-auth endpoint itself for some strange reason.
     * Or maybe it's some stupid thing that nextjs or payloadcms are doing wrong and I don't know.
     */
    const maxRecurs = 1
    let triedRecurs = 0
    // biome-ignore lint/suspicious/noExplicitAny: this is an internal temporary workaround, Promise<any> is fine
    const fireVerify2FA = async (recursion = false): Promise<any> => {
      if (recursion) triedRecurs++
      let finalResponse: any
      try {
        const response = await betterAuthClient.twoFactor.verifyTotp({
          code: data.otp.value as string,
        })
        let res = response.data
        if (typeof (response.data as unknown as Blob).text === 'function') {
          const blobText = await (response.data as unknown as Blob).text()
          res = JSON.parse(blobText)
        }
        finalResponse = res
        console.log('response', response)
      } catch (error) {
        console.debug('error fucked up verify 2fa.. ', error)
        return triedRecurs < maxRecurs
          ? fireVerify2FA(true)
          : {
              error,
            }
      }
      return finalResponse
    }
    // const workaroundResponse = await fetch(
    //   `${window.location.origin}/api/user/verify-2fa`,
    //   {
    //     method: 'post',
    //     body: JSON.stringify({
    //       code: data.otp.value as string,
    //     }),
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   },
    // )

    const response = await fireVerify2FA()

    // const response = await workaroundResponse.json()
    // console.log('response', response)

    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
      return
    }
    if (response.user) {
      setUser({ ...response.user, collection: userSlug })
      toast.success('Two-Factor Authentication verified successfully')
      // Full page reload to ensure PayloadCMS hooks are properly synced
      window.location.href = '/admin'
    } else {
      toast.error('Invalid verification code. Please try again.')
    }
    // }
  }

  return (
    <>
      <div>
        <div className={'form-header'}>
          <h1>Verify Two-Factor Authentication</h1>
          <p>
            Enter the verification code from your authenticator app to complete the login process and access your account securely.
          </p>
        </div>

        <Form
          onSubmit={submitTwoFactorVerify}
          initialState={initialState}
          method="POST"
        >
          <TextField
            field={{
              name: 'otp',
              type: 'text',
              label: 'Code',
              required: true,
              minLength: 6,
              maxLength: 6,
              admin: {
                placeholder: "000000",
                autoComplete: "one-time-code",

              },
            }}
            validate={(value) => {
              if (!value) return 'Code is required'
              if (!/^\d{6}$/.test(value)) {
                return 'OTP must be exactly 6 digits'
              }
              return true
            }}
            path="otp"
          />

          <FormSubmit size="large">{t('general:submit')}</FormSubmit>
        </Form>
      </div>
    </>
  )
}
