'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCode2FAProps {
  uri: string | null
}

export const QRCode2FA: React.FC<QrCode2FAProps> = ({ uri }) => {
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
