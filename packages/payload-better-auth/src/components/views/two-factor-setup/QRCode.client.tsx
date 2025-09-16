'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { FC, JSX } from 'react'

interface QrCode2FAProps {
  uri: string | null
}

export const QRCode2FA = ({ uri }: QrCode2FAProps): JSX.Element => {
  const [qrcode, setQrcode] = useState<string | null>(null)
  useEffect(() => {
    const getQRCodeImage = async () => {
      if (!uri) return
      const imageData = await QRCode.toDataURL(uri)
      setQrcode(imageData)
    }

    getQRCodeImage()
  }, [uri])
  return <>{qrcode && <img src={qrcode} alt="Two Factor QR Code" />}</>
}
