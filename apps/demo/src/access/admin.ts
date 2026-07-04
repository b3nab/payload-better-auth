import type { Access } from 'payload'

export const admin: Access = ({ req: { user } }) => {
  console.log('ACCESS __ admin, user?', !!user, " - admin?", user?.role === 'admin')
  return Boolean(user?.role === 'admin')
}
