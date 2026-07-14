'use client'

import type React from 'react'
import { useState } from 'react'
// import '../../index.css'

import {
  Button,
  Form,
  FormSubmit,
  PasswordField,
  TextField,
  toast,
  useConfig,
  useTranslation,
} from '@payloadcms/ui'
import type { FormState } from 'payload'
import { useBetterAuthClient } from '../../providers/BetterAuthProvider.client.js'
import { QRCode2FA } from './QRCode.client.js'

interface FormsTwoFactorProps {
  action: 'enable' | 'disable'
}

type ManageAction = 'disable' | 'regenerate' | 'show-qr'

const manageCopy: Record<
  ManageAction,
  { title: string; description: string; submitLabel: string }
> = {
  disable: {
    title: 'Disable Two-Factor Authentication',
    description:
      'Enter your password to disable Two-Factor Authentication (2FA). Disabling 2FA will reduce the security of your account and make it more vulnerable to unauthorized access.',
    submitLabel: 'Disable',
  },
  regenerate: {
    title: 'Regenerate Backup Codes',
    description:
      'Enter your password to generate a new set of backup codes. The previous backup codes will stop working.',
    submitLabel: 'Generate',
  },
  'show-qr': {
    title: 'Show QR Code',
    description:
      'Enter your password to display the QR code again, e.g. to add the authenticator to another device.',
    submitLabel: 'Show',
  },
}

const manageSwitchLabel: Record<ManageAction, string> = {
  disable: 'Disable 2FA',
  regenerate: 'Regenerate backup codes',
  'show-qr': 'Show QR code',
}

const copyBackupCodes = async (codes: string[]) => {
  const text = codes.join('\n')
  let copied = false
  // the async clipboard API exists only in secure contexts (https,
  // localhost): anywhere else, or on permission denial, fall back to the
  // legacy selection-based command
  if (navigator.clipboard) {
    copied = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    )
  }
  if (!copied) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    // keeps the virtual keyboard closed on mobile while selecting
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    copied = document.execCommand('copy')
    textarea.remove()
  }
  if (copied) {
    toast.success('Backup codes copied to clipboard')
  } else {
    toast.error('Could not copy the backup codes')
  }
}

const BackupCodesList: React.FC<{ codes: string[] }> = ({ codes }) => (
  <div style={{ margin: '1rem 0' }}>
    <p>
      Save these backup codes in a safe place. Each code can be used once to
      sign in if you lose access to your authenticator app.
    </p>
    <ul
      style={{
        columns: 2,
        fontFamily: 'monospace',
        listStyle: 'none',
        margin: '1rem 0',
        padding: 0,
      }}
    >
      {codes.map((code) => (
        <li key={code}>{code}</li>
      ))}
    </ul>
    <Button
      buttonStyle="secondary"
      size="small"
      onClick={() => void copyBackupCodes(codes)}
    >
      Copy codes
    </Button>
  </div>
)

export const FormsTwoFactor: React.FC<FormsTwoFactorProps> = ({
  action: actionFromProps,
}) => {
  const action = actionFromProps
  const { config } = useConfig()
  const {
    routes: { admin: adminRoute },
  } = config

  const { t } = useTranslation()

  const initialState: FormState = {
    password: {
      initialValue: '',
      valid: false,
      value: '',
    },
  }

  const verifyInitialState: FormState = {
    code: {
      initialValue: '',
      valid: false,
      value: '',
    },
  }

  const [needVerification, setNeedVerification] = useState(false)
  const [qrCodeURI, setQrCodeURI] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [manageAction, setManageAction] = useState<ManageAction>('disable')

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
      setBackupCodes(response.data.backupCodes)
      // two-phase enrollment (better-auth 1.6): enable only creates an
      // unverified secret; 2FA activates after the first verified code
      toast.success(
        'Almost done. Scan the QR code and verify a TOTP code to activate Two-Factor Authentication.',
      )
    }
  }

  const submitTwoFactorDisable = async (data: FormState) => {
    console.log('[two-factor] [disable] data', data)
    const response = await betterAuthClient.twoFactor.disable({
      password: data.password.value as string,
    })
    console.log('response', response)
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
      return
    }
    toast.success('Two-Factor Authentication has been disabled')
    // disabling rotates the session: the full reload picks the new cookie up
    window.location.href = adminRoute
  }

  const submitRegenerateBackupCodes = async (data: FormState) => {
    const response = await betterAuthClient.twoFactor.generateBackupCodes({
      password: data.password.value as string,
    })
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
      return
    }
    setBackupCodes(response.data.backupCodes)
    toast.success(
      'New backup codes generated. The previous ones no longer work.',
    )
  }

  const submitShowTotpUri = async (data: FormState) => {
    const response = await betterAuthClient.twoFactor.getTotpUri({
      password: data.password.value as string,
    })
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
      return
    }
    setQrCodeURI(response.data.totpURI)
  }

  const submitTwoFactorVerify = async (data: FormState) => {
    console.log('[two-factor] [verify] data', data)
    const response = await betterAuthClient.twoFactor.verifyTotp({
      code: data.code.value as string,
    })
    console.log('response', response)
    if (response.error) {
      toast.error(response.error.message || 'An error occurred')
    } else {
      toast.success('Two-Factor Authentication verified successfully')
      // try to set the user, even here it could return response.data as a Blob the first time
      // but here we don't do the same workaround as the /two-factor-verify
      // the user will be set later by the /api/user/me call
      // (the first verification also rotates the session: the full reload
      // picks the new cookie up)
      window.location.href = adminRoute
    }
  }

  const manageSubmit: Record<ManageAction, (data: FormState) => Promise<void>> =
    {
      disable: submitTwoFactorDisable,
      regenerate: submitRegenerateBackupCodes,
      'show-qr': submitShowTotpUri,
    }

  const selectManageAction = (next: ManageAction) => {
    setManageAction(next)
    setQrCodeURI(null)
    setBackupCodes(null)
  }

  return (
    <>
      {needVerification ? (
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

          {backupCodes && <BackupCodesList codes={backupCodes} />}

          <Form
            onSubmit={submitTwoFactorVerify}
            initialState={verifyInitialState}
            method="POST"
          >
            <TextField
              field={{
                name: 'code',
                type: 'text',
                label: 'Code',
                required: true,
                minLength: 6,
                maxLength: 6,
                admin: {
                  placeholder: '000000',
                  autoComplete: 'one-time-code',
                },
              }}
              validate={(value) => {
                if (!value) return 'Code is required'
                if (!/^\d{6}$/.test(value)) {
                  return 'OTP must be exactly 6 digits'
                }
                return true
              }}
              path="code"
            />

            <FormSubmit size="large">{t('general:submit')}</FormSubmit>
          </Form>
        </div>
      ) : action === 'enable' ? (
        <Form
          onSubmit={submitTwoFactorEnable}
          initialState={initialState}
          method="POST"
        >
          <div className={'form-header'}>
            <h1>Enable Two-Factor Authentication</h1>
            <p>
              Enter your password to enable Two-Factor Authentication (2FA). This will add an extra layer of security to your account and help prevent unauthorized access to the Admin Panel.
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
            Enable
            {/* {t('general:submit')} */}
          </FormSubmit>
        </Form>
      ) : (
        <div>
          <div className={'form-header'}>
            <h1>{manageCopy[manageAction].title}</h1>
            <p>{manageCopy[manageAction].description}</p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
            }}
          >
            {(Object.keys(manageCopy) as ManageAction[])
              .filter((it) => it !== manageAction)
              .map((it) => (
                <Button
                  key={it}
                  buttonStyle="pill"
                  size="small"
                  onClick={() => selectManageAction(it)}
                >
                  {manageSwitchLabel[it]}
                </Button>
              ))}
          </div>

          {manageAction === 'show-qr' && qrCodeURI && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <QRCode2FA uri={qrCodeURI} />
            </div>
          )}
          {manageAction === 'regenerate' && backupCodes && (
            <BackupCodesList codes={backupCodes} />
          )}

          <Form
            onSubmit={manageSubmit[manageAction]}
            initialState={initialState}
            method="POST"
          >
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
              {manageCopy[manageAction].submitLabel}
            </FormSubmit>
          </Form>
        </div>
      )}
    </>
  )
}
