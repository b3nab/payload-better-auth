import { guardAuth, guardRole } from '../../lib/auth'

// declare module 'payload-better-auth' {
//   export type User = import('@/payload-types').User
// }

export default async function isAuthServerPage() {
  const userGuardAuth = await guardAuth('/sign-in')
  const userGuardRole = await guardRole({ role: 'dev' })

  console.log('guardAuth Json response:: ', userGuardAuth)

  console.log('typed user ', userGuardAuth.user)

  return userGuardAuth.hasSession ? (
    <div>
      <h1>OK</h1>
      <h2>User session: {JSON.stringify(userGuardAuth.session, null, 2)}</h2>
      <p>
        User data: <pre>{JSON.stringify(userGuardAuth?.user, null, 2)}</pre>
      </p>
    </div>
  ) : (
    <p>no user</p>
  )
}
