import { isAuth, isGuest, isUser, isAdmin, isRole } from '../../lib/auth'

export default async function isAuthServerPage() {
  const userIsAuth = await isAuth()
  const userIsGuest = await isGuest()
  const userIsUser = await isUser()
  const userIsAdmin = await isAdmin()
  const userIsRole = await isRole({ role: 'dev' })

  console.log('isAuth Json response:: ', userIsAuth)

  return userIsAuth ? (
    <div>
      <h1>OK</h1>
      <h2>
        {'user isAuth(): '}
        {userIsAuth}
      </h2>
      <h2>
        {'user isGuest(): '}
        {userIsGuest}
      </h2>
      <h2>
        {'user isUser(): '}
        {userIsUser}
      </h2>
      <h2>
        {'user isAdmin(): '}
        {userIsAdmin}
      </h2>
      <h2>
        {'user isRole(dev): '}
        {userIsRole}
      </h2>
    </div>
  ) : (
    <div>
      <h1>OK</h1>
      <h2>
        {'no user - user isGuest(): '} {userIsGuest}
      </h2>
    </div>
  )
}
