// biome-ignore lint/style/useImportType: <explanation>
import { auth } from './auth'
// biome-ignore lint/style/useImportType: <explanation>
import { client } from './auth-client'

export type Session = typeof auth.$Infer.Session
export type ActiveOrganization = typeof client.$Infer.ActiveOrganization
export type Invitation = typeof client.$Infer.Invitation
