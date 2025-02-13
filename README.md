# Better Auth Plugin

## DO NOT USE IN PRODUCTION YET! THIS IS A POC, NOT COMPLETED

Better Auth plugin for Payload CMS v3!🔥

This plugin is thought to be used in production, with real users, so to be rock solid. 🗿

### ENDPOINTS

```json
[
  {
    "path": "/api/auth/sign-in/social",
    "method": "post"
  },
  {
    "path": "/api/auth/callback/:id",
    "method": "get"
  },
  {
    "path": "/api/auth/get-session",
    "method": "get"
  },
  {
    "path": "/api/auth/sign-out",
    "method": "post"
  },
  {
    "path": "/api/auth/sign-up/email",
    "method": "post"
  },
  {
    "path": "/api/auth/sign-in/email",
    "method": "post"
  },
  {
    "path": "/api/auth/forget-password",
    "method": "post"
  },
  {
    "path": "/api/auth/reset-password",
    "method": "post"
  },
  {
    "path": "/api/auth/verify-email",
    "method": "get"
  },
  {
    "path": "/api/auth/send-verification-email",
    "method": "post"
  },
  {
    "path": "/api/auth/change-email",
    "method": "post"
  },
  {
    "path": "/api/auth/change-password",
    "method": "post"
  },
  {
    "path": "/api/auth/set-password",
    "method": "post"
  },
  {
    "path": "/api/auth/update-user",
    "method": "post"
  },
  {
    "path": "/api/auth/delete-user",
    "method": "post"
  },
  {
    "path": "/api/auth/reset-password/:token",
    "method": "get"
  },
  {
    "path": "/api/auth/list-sessions",
    "method": "get"
  },
  {
    "path": "/api/auth/revoke-session",
    "method": "post"
  },
  {
    "path": "/api/auth/revoke-sessions",
    "method": "post"
  },
  {
    "path": "/api/auth/revoke-other-sessions",
    "method": "post"
  },
  {
    "path": "/api/auth/link-social",
    "method": "post"
  },
  {
    "path": "/api/auth/list-accounts",
    "method": "get"
  },
  {
    "path": "/api/auth/delete-user/callback",
    "method": "get"
  },
  {
    "path": "/api/auth/unlink-account",
    "method": "post"
  },
  {
    "path": "/api/auth/totp/generate",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/get-totp-uri",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/verify-totp",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/send-otp",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/verify-otp",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/verify-backup-code",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/generate-backup-codes",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/view-backup-codes",
    "method": "get"
  },
  {
    "path": "/api/auth/two-factor/enable",
    "method": "post"
  },
  {
    "path": "/api/auth/two-factor/disable",
    "method": "post"
  },
  {
    "path": "/api/auth/passkey/generate-register-options",
    "method": "get"
  },
  {
    "path": "/api/auth/passkey/generate-authenticate-options",
    "method": "post"
  },
  {
    "path": "/api/auth/passkey/verify-registration",
    "method": "post"
  },
  {
    "path": "/api/auth/passkey/verify-authentication",
    "method": "post"
  },
  {
    "path": "/api/auth/passkey/list-user-passkeys",
    "method": "get"
  },
  {
    "path": "/api/auth/passkey/delete-passkey",
    "method": "post"
  },
  {
    "path": "/api/auth/passkey/update-passkey",
    "method": "post"
  },
  {
    "path": "/api/auth/ok",
    "method": "get"
  },
  {
    "path": "/api/auth/error",
    "method": "get"
  }
]
```
