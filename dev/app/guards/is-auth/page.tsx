import configPromise from '@payload-config'
import { headers } from 'next/headers.js'
import { getPayload } from 'payload'
import { getBetterAuth, isAuth } from 'payload-better-auth/nextjs'

export default async function isAuthServerPage() {
  const { hasSession, data } = await isAuth(configPromise)

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
