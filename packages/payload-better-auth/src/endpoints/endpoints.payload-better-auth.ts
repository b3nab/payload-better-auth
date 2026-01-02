import type { Endpoint } from 'payload'
import { wrapInternalEndpoints } from '../payload-utilities/wrapInternalEndpoints.js'
import { loginHandler } from './login.js'
import { logoutHandler } from './logout.js'
import { meHandler } from './me.js'
import { refreshHandler } from './refresh.js'
import { registerFirstUserHandler } from './registerFirstUser.js'

// TODO: add all endpoints
// TODO: add all handlers
export const payloadBetterAuthEndpoints: Endpoint[] = wrapInternalEndpoints([
  // {
  //   handler: forgotPasswordHandler,
  //   method: 'post',
  //   path: '/forgot-password',
  // },
  // /init is not needed because it's handled by payloadcms
  // {
  //   handler: initHandler,
  //   method: 'get',
  //   path: '/init',
  // },
  {
    handler: loginHandler,
    method: 'post',
    path: '/login',
  },
  {
    handler: logoutHandler,
    method: 'post',
    path: '/logout',
  },
  {
    handler: meHandler,
    method: 'get',
    path: '/me',
  },
  {
    handler: refreshHandler,
    method: 'post',
    path: '/refresh-token',
  },
  {
    handler: registerFirstUserHandler,
    method: 'post',
    path: '/first-register',
  },
  // {
  //   handler: resetPasswordHandler,
  //   method: 'post',
  //   path: '/reset-password',
  // },
  // {
  //   handler: unlockHandler,
  //   method: 'post',
  //   path: '/unlock',
  // },
  // {
  //   handler: verifyEmailHandler,
  //   method: 'post',
  //   path: '/verify/:id',
  // },
])
