import { createAccessControl } from 'better-auth/plugins/access'
import {
  adminAc,
  defaultStatements,
  userAc,
} from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements,
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
}

export const ac = createAccessControl(statement)

const user = ac.newRole({
  payloadcms: [],
  byRole: ['user'],
  ...userAc.statements,
})

const admin = ac.newRole({
  payloadcms: ['access'],
  byRole: ['user', 'admin'],
  ...adminAc.statements,
})

export const roles = {
  user,
  admin,
}
