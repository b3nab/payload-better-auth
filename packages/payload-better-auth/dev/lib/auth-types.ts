import type { getAuth } from './auth.js'
import { client } from './auth-client.js'

type AUTH = Awaited<ReturnType<typeof getAuth>>

// better-auth minimal has no $Infer: getSession returns the same
// { session, user } shape
export type Session = NonNullable<
  Awaited<ReturnType<AUTH['api']['getSession']>>
>
export type ActiveOrganization = typeof client.$Infer.ActiveOrganization
export type Invitation = typeof client.$Infer.Invitation
