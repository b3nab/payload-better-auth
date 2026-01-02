import { headers } from 'next/headers.js'
import { serverBefore } from '../server.before.js'
import type { BetterAuthPluginOptions } from '../../types.js'
import type { SanitizedConfig } from 'payload'
import type {
  InferBetterAuthInstance,
  InferPlugins,
} from '../../better-auth/instance.js'
import { betterAuth } from 'better-auth/minimal'
import { admin } from 'better-auth/plugins'

// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC = never,
//   // > = GetPlugin<O> extends { id: 'admin' }
// > = O['betterAuth'] extends { plugins: infer BAPS }
//   ? BAPS extends { id: 'admin' }[]
//     ? RolesFromOptions<O> extends never
//       ? AdminRoles<O>
//       : // ? DefaultRoles // RolesFromPermissions<RC>
//         RolesFromOptions<O>
//     : RolesFromOptions<O> extends never
//       ? RolesFromPermissions<RC>
//       : RolesFromOptions<O>
//   : DefaultRoles

export type RoleConfig = NonNullable<
  NonNullable<Parameters<typeof admin>[0]>['roles']
>

export type DefaultRoles = 'user' | 'admin'

// type AdminPlugin<O extends BetterAuthPluginOptions> = Extract<
//   InferPlugins<O>,
//   { id: 'admin' }
// >

// type GetPlugin<O extends BetterAuthPluginOptions> = NonNullable<
//   O['betterAuth']
// >['plugins'] extends Array<infer P>
//   ? P
//   : never

type GetPlugin<O extends BetterAuthPluginOptions> = O['betterAuth'] extends {
  plugins: infer Plugins
}
  ? Plugins extends readonly (infer P)[]
    ? P
    : Plugins extends (infer P)[]
      ? P
      : never
  : never

// Extract admin plugin's options (the parameter passed to admin() function)
type ExtractAdminOptions<P> = P extends {
  id: 'admin'
  options?: infer Opts
}
  ? Opts
  : never

type RolesFromPermissions<RC> = RC extends object ? keyof RC : never

// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC = never,
// > = GetPlugin<O> extends infer PLUG
//   ? PLUG extends { id: 'admin' }
//     ? // > = O['betterAuth'] extends { plugins: infer BAPS }
//       // ? BAPS extends { id: 'admin' }
//       RC extends object
//       ? 'FROM_PERM' // RolesFromPermissions<RC>
//       : 'FROM_ADM' // AdminRoles<O>
//     : DefaultRoles
//   : // : // ? DefaultRoles // RolesFromPermissions<RC>
//     //   RolesFromOptions<O>
//     // : RolesFromOptions<O> extends never
//     //   ? RolesFromPermissions<RC>
//     //   : RolesFromOptions<O>
//     'DefaultRolesLAST'

// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC extends RoleConfig = object,
// > = AdminPlugin<O> extends { id: 'admin' }
//   ? keyof RC extends never
//     ? RolesFromOptions<O> extends never
//       ? DefaultRoles
//       : RolesFromOptions<O>
//     : RolesFromPermissions<RC>
//   : DefaultRoles

// ....................
// COMPLETE
// ....................
// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC extends RoleConfig = never,
// > = [GetPlugin<O>] extends [never]
//   ? DefaultRoles
//   : GetPlugin<O> extends { id: 'admin' }
//     ? keyof RC extends never
//       ? RolesFromOptions<O> extends never
//         ? DefaultRoles
//         : RolesFromOptions<O>
//       : RolesFromPermissions<RC>
//     : DefaultRoles
// ....................
// ....................
// ....................

type GetPLUGbyID<
  O extends BetterAuthPluginOptions,
  ID extends string,
> = Extract<GetPlugin<O>, { id: ID }>
type GetADM<O extends BetterAuthPluginOptions> = GetPLUGbyID<O, 'admin'>

// // ....................
// // IMPROVE GetPlugin<O> extends { id: 'admin' }
// // ....................
// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC = never,
// > = GetADM<O> extends never
//   ? DefaultRoles // "DefaultRoles-NO-admin()"
//   : // : GetADM<O> extends { id: 'admin' }
//     RolesFromOptions<O> extends never
//     ? RC extends never
//       ? DefaultRoles // "DefaultRoles-nothing"
//       : RolesFromPermissions<RC>
//     : RolesFromOptions<O>
// // : "DefaultRoles-no-admin()--2"
// // ....................
// // ....................
// // ....................

// ....................
// SLIM Version
// ....................
export type InferRoles<O extends BetterAuthPluginOptions> =
  GetADM<O> extends never
    ? DefaultRoles // "DefaultRoles-NO-admin()"
    : // : GetADM<O> extends { id: 'admin' }
      RolesFromOptions<O> extends never
      ? DefaultRoles // "DefaultRoles-nothing"
      : RolesFromOptions<O>
// : "DefaultRoles-no-admin()--2"
// ....................
// ....................
// ....................

type NEV = never
type isnever_keyof = keyof NEV extends never ? 'NEVER' : 'something'

type adm = GetADM<DEFFF_PLUG>
//   ^?

type rolesOPT = InferRoles<DEFFF_PLUG>
//    ^?
// type rolesOPT = [GetADM<DEFFF_PLUG>] extends [never] ? 'never' : 'ok'
// //    ^?
// type rolesOPT = GetADM<DEFFF_PLUG> extends never ? 'never' : 'admin'
// //    ^?

// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC extends RoleConfig = never,
// > = GetPlugin<O> extends { id: 'admin' }
//     ? keyof RC extends never
//       ? "PLUGIN"
//       : "RC" // keyof RC
//     : "Defail"

//     //   ? RolesFromOptions<O> extends never
//     //     ? DefaultRoles
//     //     : RolesFromOptions<O>
//     //   : RolesFromPermissions<RC>
//     // : DefaultRoles

// export type InferRoles<
//   O extends BetterAuthPluginOptions,
//   RC extends RoleConfig = never,
// > = [GetPlugin<O>] extends [never]
//   ? 'DefaultRoles1'
//   : GetPlugin<O> extends { id: 'admin' }
//     ? keyof RC extends never
//       ? 'RC'
//       : 'DefaultRoles2'
//     : // ? RolesFromOptions<O> extends never
//       //   ? "DefaultRoles2"
//       //   : RolesFromOptions<O>
//       // : RolesFromPermissions<RC>
//       'DefaultRoles3'

type AdminPlugin<O extends BetterAuthPluginOptions> =
  GetPlugin<O> extends infer P ? (P extends { id: 'admin' } ? P : never) : never

type AdminRoles<O extends BetterAuthPluginOptions> =
  // Try to infer from admin plugin's $Infer.Session.user.role (1.4.9+ structure)
  AdminPlugin<O> extends {
    $Infer: { Session: { user: { role: infer R } } }
  }
    ? R extends readonly (infer U)[]
      ? U
      : R
    : // Fallback to endpoints.setRole metadata path
      AdminPlugin<O> extends {
          endpoints: {
            setRole: {
              options: { metadata: { $Infer: { body: { role: infer R } } } }
            }
          }
        }
      ? R extends readonly (infer U)[]
        ? U
        : R
      : 'DEF_ADM'

type RolesFromOptions<O extends BetterAuthPluginOptions> =
  // Extract admin plugin options and check for roles property
  ExtractAdminOptions<GetADM<O>> extends infer AdminOpts
    ? AdminOpts extends { roles: Record<string, unknown> }
      ? keyof AdminOpts['roles']
      : never
    : never

const rs = {
  admin: undefined,
  user: undefined,
  dev: undefined,
  test: undefined,
  new: undefined,
}

const defaultConf_PLUG = {
  betterAuth: {
    plugins: [
      admin({
        roles: rs,
      }),
    ],
  },
}
type DEFFF_PLUG = typeof defaultConf_PLUG

type _FROM_DEFF = RolesFromOptions<DEFFF_PLUG>
//    ^?

type GETPLUGS = GetPlugin<DEFFF_PLUG>
//      ^?

type _ISPLUG = [GetPlugin<DEFFF_PLUG>] extends [never]
  ? 'DefaultRoles1'
  : GetPlugin<DEFFF_PLUG>

type ISPLUG = _ISPLUG
//    ^?

type GET_PLUGS_BY_ID<ID extends string> = Extract<GETPLUGS, { id: ID }>

type ADM = GET_PLUGS_BY_ID<'admin'>
//   ^?

type _ISADM = GET_PLUGS_BY_ID<'admin'> extends never ? 'NO' : 'YES'

type ISADM = _ISADM
//   ^?

// type EXInternalRolesDEFFF = ExtractInferRoles<DEFFF>
//      ^?

type ROLES = InferRoles<never>
//      ^?
// "DefaultRoles"

type ROLES_EMPTY = InferRoles<object>
//      ^?
// "DefaultRoles"

type ROLES_PLUG = InferRoles<DEFFF_PLUG>
//      ^?
// "RolesFromOptions"

type ROLES_PERMISS = InferRoles<object> //, typeof rs>
//      ^?
// "DefaultRoles"

type ROLES_FULL = InferRoles<DEFFF_PLUG> //, typeof rs>
//      ^?
// "RolesFromPermissions"

export type IsRoleArgs<O extends BetterAuthPluginOptions> = {
  role: InferRoles<O> // extends never ? DefaultRoles : keyof Roles
}

export const isRole =
  <O extends BetterAuthPluginOptions>(
    configPromise: Promise<SanitizedConfig>,
    pluginOptions: O,
  ) =>
  async ({ role }: IsRoleArgs<O>) => {
    const { payload, betterAuth } = await serverBefore(configPromise)

    const data = await betterAuth.api.getSession({
      headers: await headers(),
    })

    // const responsePermission = await betterAuth.api.userHasPermission({
    //   headers: await headers(),
    //   body: {
    //     permissions: {
    //       byRole: [role as any],
    //     },
    //   },
    // })

    const userIsRole = data?.user.role === role

    // console.log('isRole :: ', userIsRole)

    return Boolean(userIsRole)
  }
