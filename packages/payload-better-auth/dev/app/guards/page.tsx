// import { guardAuth } from '../../lib/auth'

export default async function isAuthServerPage() {
  const userGuardAuth = false // await guardAuth()

  console.log('guardAuth Json response:: ', userGuardAuth)

  return userGuardAuth ? (
    <div>
      <h1>OK</h1>
      <h2>user guard auth: {userGuardAuth}</h2>
    </div>
  ) : (
    <p>no user</p>
  )
}
