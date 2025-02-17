import {
  Forbidden,
  type PayloadHandler,
  type Payload,
  headersWithCors,
  generatePayloadCookie,
} from 'payload'
import { status as httpStatus } from 'http-status'
import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'

export const registerFirstUserHandler: PayloadHandler = async (req) => {
  console.log('[payload-better-auth] registerFirstUserHandler')
  console.log('req', req)

  const collection = getRequestCollection(req)
  const authData: Record<string, any> = collection.config.auth
    ?.loginWithUsername
    ? {
        email: typeof req.data?.email === 'string' ? req.data.email : '',
        password:
          typeof req.data?.password === 'string' ? req.data.password : '',
        username:
          typeof req.data?.username === 'string' ? req.data.username : '',
      }
    : {
        email: typeof req.data?.email === 'string' ? req.data.email : '',
        password:
          typeof req.data?.password === 'string' ? req.data.password : '',
      }

  authData.name = typeof req.data?.name === 'string' ? req.data.name : ''
  authData.emailVerified =
    typeof req.data?.emailVerified === 'boolean'
      ? req.data.emailVerified
      : false
  authData.twoFactorEnabled =
    typeof req.data?.twoFactorEnabled === 'boolean'
      ? req.data.twoFactorEnabled
      : false

  const {
    config,
    config: {
      slug,
      auth: { verify },
    },
  } = collection
  const { payload, data, t } = req

  // const user = await payload.find({ collection: 'users', where: { email } })

  console.log(
    // config: ${JSON.stringify(config, null, 2)}
    // payload: ${JSON.stringify(payload, null, 2)}
    // data: ${JSON.stringify(data, null, 2)}
    // t: ${t}
    // verify: ${verify}
    `
    slug: ${slug}
    authData: ${JSON.stringify(authData, null, 2)}

  `,
  )

  const doc = await payload.db.findOne({
    collection: config.slug,
    req,
  })

  if (doc) {
    throw new Forbidden(req.t)
  }

  // /////////////////////////////////////
  // Register first user
  // /////////////////////////////////////

  // const result = await payload.create({
  //   collection: slug,
  //   data: data as any,
  //   overrideAccess: true,
  //   req,
  // })

  const betterAuth = getBetterAuth()

  const response = await betterAuth?.api.signUpEmail({
    body: {
      name: authData.name,
      // username: authData.username,
      email: authData.email,
      password: authData.password,
      emailVerified: verify ? true : authData.emailVerified,
      twoFactorEnabled: authData.twoFactorEnabled,
    },
    asResponse: true,
  })
  invariant(response, 'Failed to register user')

  const result = await response.json()
  invariant(result.token, 'User registered but no token returned')

  // if (verify) {
  //   // auto-verify (if applicable)
  //   await payload.update({
  //     id: result.user.id,
  //     collection: slug,
  //     data: {
  //       _verified: true,
  //     },
  //     req,
  //   })
  // }

  // const cookie = generatePayloadCookie({
  //   collectionAuthConfig: collection.config.auth,
  //   cookiePrefix: req.payload.config.cookiePrefix,
  //   token: result.token,
  // })

  return Response.json(
    {
      // exp: result.exp,
      message: t('authentication:successfullyRegisteredFirstUser'),
      token: result.token,
      user: result.user,
    },
    {
      headers: headersWithCors({
        headers: response.headers,
        // new Headers({
        //   'Set-Cookie': cookie,
        // }),
        req,
      }),
      status: httpStatus.OK,
    },
  )
}
