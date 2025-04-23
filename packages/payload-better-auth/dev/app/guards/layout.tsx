export const metadata = {
  title: 'Payload Better Auth - Guards',
  description: 'Demo implementation of payload-better-auth guards',
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
