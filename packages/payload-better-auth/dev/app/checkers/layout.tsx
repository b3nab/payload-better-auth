export const metadata = {
  title: 'Payload Better Auth - Checkers',
  description: 'Demo implementation of payload-better-auth checkers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
