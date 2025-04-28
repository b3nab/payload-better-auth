import { guardAuth } from '../../lib/auth'

export default async function isAuthServerPage() {
  const userGuardAuth = await guardAuth('/sign-in')

  console.log('guardAuth Json response:: ', userGuardAuth)

  return userGuardAuth.hasSession === true ? (
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
