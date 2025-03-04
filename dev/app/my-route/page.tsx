import configPromise from '@payload-config'
import { headers } from 'next/headers.js'
import { getPayload } from 'payload'
import { getBetterAuth, isAuth } from 'payload-better-auth/nextjs'

export const SSRComponent = async () => {
  const { hasSession, data } = await isAuth(configPromise)

  console.log('getSession Json response:: ', data)

  // const data = await payload.find({
  //   collection: 'users',
  // })

  // return Response.json(data)

  return hasSession ? (
    <div>
      <h1>OK</h1>
      <h2>user: {data.user.email}</h2>
    </div>
  ) : (
    <p>no user</p>
  )
}

export default SSRComponent
