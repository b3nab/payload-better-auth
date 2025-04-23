import { defaultStatements, userAc as userAcPBA } from '../../src'

import { createAccessControl } from 'better-auth/plugins/access'
import {
  // defaultStatements,
  adminAc as adminAcFromBetterAuth,
  userAc as userAcFromBetterAuth,
} from 'better-auth/plugins/admin/access'

export const statement = {
  ...defaultStatements,
  devarea: ['access'],
} as const

export const ac = createAccessControl(statement)

export const userAc = ac.newRole({
  payloadcms: [],
  byRole: ['user'],
  ...userAcFromBetterAuth.statements,
})

const adminAc = ac.newRole({
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
  ...adminAcFromBetterAuth.statements,
})

const devAc = ac.newRole({
  devarea: ['access'],
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
  ...adminAcFromBetterAuth.statements,
})

export const roles = {
  user: userAc,
  admin: adminAc,
  dev: devAc,
}
