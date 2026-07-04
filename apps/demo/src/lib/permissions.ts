import {
  defaultStatements,
  userAc as userAcPBA,
  adminAc as adminAcPBA,
} from '@b3nab/payload-better-auth'

import { createAccessControl } from 'better-auth/plugins/access'

export const statement = {
  ...defaultStatements,
  operatorarea: ['access'],
} as const

export const acDEMO = createAccessControl(statement)

export const userAc = acDEMO.newRole({
  ...userAcPBA.statements,
})

const adminAc = acDEMO.newRole({
  ...adminAcPBA.statements,
})

const operatorAc = acDEMO.newRole({
  operatorarea: ['access'],
  ...adminAcPBA.statements,
})

export const rolesDEMO = {
  user: userAc,
  admin: adminAc,
  operator: operatorAc,
}
