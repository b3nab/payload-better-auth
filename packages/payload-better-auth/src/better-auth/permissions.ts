import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access"

const statement = {
  ...defaultStatements,
  payloadcms: ['access']
}

export const ac = createAccessControl(statement)

const user = ac.newRole({
  payloadcms: [],
  ...userAc.statements
})

const admin = ac.newRole({
  payloadcms: ['access'],
  ...adminAc.statements
})

export const roles = {
user,
admin
}