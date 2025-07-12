import './global.css'
import { RootProvider } from 'fumadocs-ui/provider'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'

const inter = Inter({
  subsets: ['latin'],
})

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          {children}
          <Script
            src={`${process.env.NEXT_PUBLIC_RYBBIT_HOST}/api/script.js`}
            data-site-id={process.env.NEXT_PUBLIC_RYBBIT_ID}
            data-web-vitals="true"
            data-track-errors="true"
            data-session-replay="true"
            strategy="afterInteractive"
          />
        </RootProvider>
      </body>
    </html>
  )
}
