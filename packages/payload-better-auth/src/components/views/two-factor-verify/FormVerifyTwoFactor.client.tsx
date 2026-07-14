'use client'

import type React from 'react'
import { useState } from 'react'

import {
  Banner,
  Button,
  CheckboxField,
  Form,
  FormSubmit,
  TextField,
  toast,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import { formatAdminURL } from '@payloadcms/ui/shared'
import type { FormState } from 'payload'
import { useBetterAuthClient } from '../../providers/BetterAuthProvider.client.js'

type VerifyMethod = 'totp' | 'backup' | 'otp'

interface FormVerifyTwoFactorProps {
  /** the otp flow needs a host-configured sender (otpOptions.sendOTP) */
  otpAvailable?: boolean
}

const methodCopy: Record<
  VerifyMethod,
  { title: string; description: string; label: string }
> = {
  totp: {
    title: 'Verify Two-Factor Authentication',
    description:
      'Enter the verification code from your authenticator app to complete the login process and access your account securely.',
    label: 'Code',
  },
  backup: {
    title: 'Use a Backup Code',
    description:
      'Enter one of your backup codes to complete the login process. Each backup code can only be used once.',
    label: 'Backup code',
  },
  otp: {
    title: 'Verify One-Time Code',
    description:
      'Enter the one-time code you received to complete the login process.',
    label: 'Code',
  },
}

export const FormVerifyTwoFactor: React.FC<FormVerifyTwoFactorProps> = ({
  otpAvailable = false,
}) => {
  const { config } = useConfig()
  const {
    admin: {
      //     routes: { forgot: forgotRoute },
      routes: { login: loginRoute },
    },
    routes: { admin: adminRoute },
  } = config
  const { t } = useTranslation()

  const initialState: FormState = {
    otp: {
      initialValue: '',
      valid: false,
      value: '',
    },
    trustDevice: {
      initialValue: false,
      valid: true,
      value: false,
    },
  }

  const { betterAuthClient } = useBetterAuthClient()

  const [method, setMethod] = useState<VerifyMethod>('totp')
  const [locked, setLocked] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // TODO: FIX:
  /**
   * UGLY WORKAROUND FOR BETTER AUTH verifyTotp
   * The first time it returns a corrupted response.data in a Blob format (probably because it's malformed and it's improperly seen as Blob).
   * The second time it returns the correct response with data or error as stated by better-auth docs.
   * This workaround makes the api call to verifyTotp a recursive function by setting the max recursion with `const maxRecurs = 1` (keep in mind that 1 means 1 recursion so 1st standard execution + 1 real recursion)
   * Maybe it's a problem with the better-auth endpoint itself for some strange reason.
   * Or maybe it's some stupid thing that nextjs or payloadcms are doing wrong and I don't know.
   */
  const normalizeResponseData = async (
    data: unknown,
  ): Promise<Record<string, unknown> | null> => {
    if (data && typeof (data as Blob).text === 'function') {
      return JSON.parse(await (data as Blob).text())
    }
    return data as Record<string, unknown> | null
  }

  // better-auth 1.6 budgets failed verifications at two levels: 5 wrong
  // codes consume the pending challenge (its cookie is expired server-side),
  // 10 consecutive failures lock the account for accountLockout
  // .durationSeconds (default 15 minutes). lockedUntil never reaches the
  // client (returned: false), so the lock message cannot carry a countdown
  const handleVerifyError = (error: { code?: string; message?: string }) => {
    switch (error.code) {
      case 'ACCOUNT_TEMPORARILY_LOCKED': {
        setLocked(true)
        toast.error(
          'Too many failed verification attempts. Your account is temporarily locked. Please try again later.',
        )
        return
      }
      case 'TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE':
      case 'INVALID_TWO_FACTOR_COOKIE': {
        toast.error(
          'This verification session is no longer valid. Please sign in again.',
        )
        window.location.href = formatAdminURL({
          adminRoute,
          path: loginRoute,
        })
        return
      }
      default:
        toast.error(error.message || 'An error occurred')
    }
  }

  const submitTwoFactorVerify = async (data: FormState) => {
    console.log('[two-factor] [verify] data', data)

    const body = {
      code: data.otp.value as string,
      trustDevice: data.trustDevice?.value === true,
    }
    const response =
      method === 'totp'
        ? await betterAuthClient.twoFactor.verifyTotp(body)
        : method === 'backup'
          ? await betterAuthClient.twoFactor.verifyBackupCode(body)
          : await betterAuthClient.twoFactor.verifyOtp(body)
    console.log('response', response)

    // const response = await workaroundResponse.json()
    // console.log('response', response)

    if (response.error) {
      handleVerifyError(response.error)
      return
    }

    const result = await normalizeResponseData(response.data)

    if (result?.user) {
      toast.success('Two-Factor Authentication verified successfully')
      // Full page reload to ensure PayloadCMS hooks are properly synced
      window.location.href = adminRoute
    } else {
      toast.error('Invalid verification code. Please try again.')
    }
  }

  const sendOtp = async () => {
    const response = await betterAuthClient.twoFactor.sendOtp({})
    if (response.error) {
      handleVerifyError(response.error)
      return
    }
    setOtpSent(true)
    toast.success('A one-time code has been sent')
  }

  const selectMethod = (next: VerifyMethod) => {
    setMethod(next)
    if (next !== 'otp') {
      setOtpSent(false)
    }
  }

  const copy = methodCopy[method]
  // the otp code exists only after the server sent one
  const showForm = method !== 'otp' || otpSent

  return (
    <>
      <div>
        <div className={'form-header'}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        {locked && (
          <Banner type="error">
            Too many failed verification attempts. Your account is temporarily
            locked. Please try again later.
          </Banner>
        )}

        {method === 'otp' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button buttonStyle="secondary" size="medium" onClick={sendOtp}>
              {otpSent ? 'Resend code' : 'Send code'}
            </Button>
          </div>
        )}

        {showForm && (
          <Form
            onSubmit={submitTwoFactorVerify}
            initialState={initialState}
            method="POST"
          >
            {/* payload spaces stacked fields through this wrapper:
                .render-fields > .field-type gets margin-bottom */}
            <div className="render-fields">
              <TextField
                field={{
                  name: 'otp',
                  type: 'text',
                  label: copy.label,
                  required: true,
                  ...(method === 'backup'
                    ? {}
                    : { minLength: 6, maxLength: 6 }),
                  admin: {
                    autoComplete: 'one-time-code',
                    ...(method === 'backup' ? {} : { placeholder: '000000' }),
                  },
                }}
                validate={(value) => {
                  if (!value) return 'Code is required'
                  if (method !== 'backup' && !/^\d{6}$/.test(value)) {
                    return 'OTP must be exactly 6 digits'
                  }
                  return true
                }}
                path="otp"
              />

              <CheckboxField
                field={{
                  name: 'trustDevice',
                  type: 'checkbox',
                  label: 'Trust this device for 30 days',
                }}
                path="trustDevice"
              />
            </div>

            <FormSubmit size="large">{t('general:submit')}</FormSubmit>
          </Form>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
        >
          {method !== 'totp' && (
            <Button
              buttonStyle="pill"
              size="small"
              onClick={() => selectMethod('totp')}
            >
              Use your authenticator app
            </Button>
          )}
          {method !== 'backup' && (
            <Button
              buttonStyle="pill"
              size="small"
              onClick={() => selectMethod('backup')}
            >
              Use a backup code
            </Button>
          )}
          {otpAvailable && method !== 'otp' && (
            <Button
              buttonStyle="pill"
              size="small"
              onClick={() => selectMethod('otp')}
            >
              Send a one-time code
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
