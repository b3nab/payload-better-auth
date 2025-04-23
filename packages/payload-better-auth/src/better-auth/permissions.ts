import { createAccessControl } from 'better-auth/plugins/access'
import {
  defaultStatements as defaultStatementsFromBetterAuth,
  adminAc as adminAcFromBetterAuth,
  userAc as userAcFromBetterAuth,
} from 'better-auth/plugins/admin/access'

export const defaultStatements = {
  ...defaultStatementsFromBetterAuth,
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
} as const

export const ac = createAccessControl(defaultStatements)

export const userAc = ac.newRole({
  payloadcms: [],
  byRole: ['user'],
  ...userAcFromBetterAuth.statements,
})

export const adminAc = ac.newRole({
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
  ...adminAcFromBetterAuth.statements,
})

export const roles = {
  user: userAc,
  admin: adminAc,
}
