import {
  Forbidden,
  type PayloadHandler,
  headersWithCors,
} from 'payload'
import { status as httpStatus } from 'http-status'
import { getRequestCollection } from '../payload-utilities/getRequestEntity.js'
import { getBetterAuth, getBetterAuthSafe } from '../singleton.better-auth.js'
import invariant from 'tiny-invariant'
import { getLogger } from '../singleton.logger.js'

export const registerFirstUserHandler: PayloadHandler = async (req) => {
  const logger = getLogger()
  logger.trace('[payload-better-auth] registerFirstUserHandler')

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

  const betterAuth = getBetterAuthSafe()

  const response = await betterAuth.api.signUpEmail({
    body: {
      // role: 'admin',
      name: authData.name,
      // username: authData.username,
      email: authData.email,
      password: authData.password,
      // emailVerified: verify ? true : authData.emailVerified,
      // twoFactorEnabled: authData.twoFactorEnabled,
    },
    asResponse: true,
  })
  invariant(response, 'Failed to register user')

  const result = await response.json()
  invariant(result.token, 'User registered but no token returned')

  await payload.update({
    collection: 'user',
    id: result.user.id,
    data: {
      role: 'admin',
      emailVerified: verify ? true : authData.emailVerified,
    },
    overrideAccess: true,
  })

  // Check if 2FA plugin is enabled in the config
  const twoFactorPluginEnabled =
    payload.config.custom?.authFlows?.twoFactor ?? false

  return Response.json(
    {
      message: t('authentication:successfullyRegisteredFirstUser'),
      token: result.token,
      user: {
        ...result.user,
        role: 'admin',
        emailVerified: verify ? true : authData.emailVerified,
      },
      // Include 2FA setup information for the client
      twoFactor: {
        enabled: twoFactorPluginEnabled,
        userHasTwoFactor: false,
        shouldPromptSetup: twoFactorPluginEnabled,
      },
    },
    {
      headers: headersWithCors({
        headers: response.headers,
        req,
      }),
      status: httpStatus.OK,
    },
  )
}
