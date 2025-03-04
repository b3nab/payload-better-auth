import { isGuest } from 'payload-better-auth/nextjs'
import configPromise from '@payload-config'

export default async function isGuestServerPage() {
  const { hasSession, data } = await isGuest(configPromise)

  console.log('isAuth Json response:: ', data)

  return hasSession ? (
    <div>
      <h1>OK</h1>
      <h2>user: {data.user.email}</h2>
    </div>
  ) : (
    <p>no user</p>
  )
}
