import configPromise from '@payload-config'
import { headers } from 'next/headers.js'
import { getPayload } from 'payload'
import { getBetterAuth } from 'payload-better-auth/nextjs'

export const SSRComponent = async () => {
  const payload = await getPayload({
    config: configPromise,
  })

  const betterAuth = await getBetterAuth(payload)

  const responseSession = await betterAuth?.api.getSession({
    headers: await headers(),
    asResponse: true,
  })

  const data = await responseSession?.json()

  console.log('getSession Json response:: ', data)

  // const data = await payload.find({
  //   collection: 'users',
  // })

  // return Response.json(data)

  return data?.user ? (
    <div>
      <h1>OK</h1>
      <h2>user: {data.user.email}</h2>
    </div>
  ) : (
    <p>no user</p>
  )
}

export default SSRComponent
