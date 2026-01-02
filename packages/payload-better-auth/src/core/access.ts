import type { Access, CollectionConfig } from 'payload'
import { getLogger } from '../singleton.logger.js'
// -----------------------------------
// Access Control default functions
// -----------------------------------

// isAdmin
const isAdmin: NonNullable<CollectionConfig['access']>['admin'] = ({
  req,
}) => {
  // getLogger().debug(user, `ACCESS CONTROL on admin - for user:`)
  const user = req.user as any

  // Normal case: real authenticated user
  if (user?.role === 'admin') return true

  // Pending 2FA: allow only admin routes needed to complete 2FA
  // (We use a placeholder user during 2FA pending, so role is not available yet.)
  if (user?._twoFactorPending === true && typeof (req as any)?.url === 'string') {
    try {
      const pathname = new URL((req as any).url).pathname

      // Allow dashboard route (so we can render and immediately redirect server-side),
      // and allow the verify page itself.
      if (pathname === '/admin' || pathname === '/admin/') return true
      if (pathname.startsWith('/admin/two-factor-verify')) return true
    } catch {
      // fallthrough
    }
  }

  return false
}

const isUser: Access = ({ req: { user } }) => {
  // getLogger().debug(user, `ACCESS CONTROL on user - for user:`)
  return Boolean(user?.role === 'user')
}

// exports
export { isAdmin, isUser }
