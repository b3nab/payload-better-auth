import type { Access, CollectionConfig } from 'payload'
import { getLogger } from '../singleton.logger'
// -----------------------------------
// Access Control default functions
// -----------------------------------

// isAdmin
const isAdmin: NonNullable<CollectionConfig['access']>['admin'] = ({
  req: { user },
}) => {
  // getLogger().debug(user, `ACCESS CONTROL on admin - for user:`)
  return Boolean(user?.role === 'admin')
}

const isUser: Access = ({ req: { user } }) => {
  // getLogger().debug(user, `ACCESS CONTROL on user - for user:`)
  return Boolean(user?.role === 'user')
}

// exports
export { isAdmin, isUser }
