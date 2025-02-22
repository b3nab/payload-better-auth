import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

interface QrCode2FAProps {
  uri: string
}

export const QRCode2FA = ({ uri }: QrCode2FAProps) => {
  const [qrcode, setQrcode] = useState('')
  useEffect(() => {
    const getQRCodeImage = async () => {
      const imageData = await QRCode.toDataURL(uri)
      setQrcode(imageData)
    }

    uri && getQRCodeImage()
  }, [uri])
  return <img src={qrcode} alt="Two Factor QR Code" />
}
