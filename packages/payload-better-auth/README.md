# Payload Better Auth Plugin

A plugin that integrates [Better Auth](https://www.better-auth.com) with [Payload CMS v3](https://payloadcms.com), providing enhanced authentication capabilities.
Built to be used in production, with real users, so to be rock solid. 🗿

**[Documentation](https://payload-better-auth.abbenanti.com/docs)** · [Issues](https://github.com/b3nab/payload-better-auth/issues)

## Description

This plugin is a wrapper around the better-auth library. It provides a better-way 🤓 to manage authentication for Payload CMS v3.

The goal is to seamlessly integrate better-auth in your Payload CMS v3 application, providing a robust and feature-rich authentication system with a focus on user experience and developer productivity.

### Why This Plugin?

While Payload CMS comes with a solid and extensible authentication system out of the box, it primarily focuses on basic email/password authentication and API keys. This serves many use cases well, but modern applications often require more sophisticated authentication methods and features.

### Features

- Payload collections auto-generated from your Better Auth options (JSON fields, dropdowns, hidden secrets, read-only system fields)
- Better Auth API endpoints mounted for you at `/api/auth/*`
- Payload database adapter for Better Auth, with transactions, joins, and automatic cleanup of dependent records on delete
- `payload.betterAuth` instance, fully typed with your own plugin options
- Two-Factor Authentication (TOTP) wired into the Payload admin UI
- Social login buttons auto-injected into the admin login screen
- Default email verification and password reset flows (overridable)
- Role-based access control with `admin` and `user` roles out of the box
- Auth layer helpers for Next.js (checkers, guards)

## Important Notes

1. Contributions via issues and PRs are highly encouraged
2. Maintainers are not responsible for issues that may occur

### License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE). For commercial licensing options, please contact the maintainer.

## Installation

Install the plugin and its peer dependencies:

```bash
pnpm add @b3nab/payload-better-auth better-auth better-auth-harmony
```

## Quick Start

Create the plugin config in its own file:

```ts
// lib/payload-better-auth.config.ts
import { defineBetterAuthPluginOptions } from '@b3nab/payload-better-auth'

export const payloadBetterAuthConfig = defineBetterAuthPluginOptions({
  // Better Auth Config. https://www.better-auth.com/docs/reference/options
  betterAuth: {
    // used by two factor plugin as an issuer and other things
    appName: 'My App',
    // better-auth secret - you can omit it if your env variable is named `BETTER_AUTH_SECRET`
    /** you can generate a good secret
     * using the following command:
     * @example
     * openssl rand -base64 32
     */
    secret: process.env.BETTER_AUTH_SECRET,
  },
})

// makes payload.betterAuth fully typed with YOUR options, everywhere
declare module '@b3nab/payload-better-auth' {
  interface PayloadBetterAuthRegister {
    pluginOptions: typeof payloadBetterAuthConfig
  }
}
```

Then add the plugin to your `payload.config.ts` file:

```ts
import { buildConfig } from 'payload'
import { betterAuthPlugin } from '@b3nab/payload-better-auth'
import { payloadBetterAuthConfig } from './lib/payload-better-auth.config'

export default buildConfig({

  // ... other config

  plugins: [
    betterAuthPlugin(payloadBetterAuthConfig),

    // ... other plugins

  ],
})
```

See the [documentation](https://payload-better-auth.abbenanti.com/docs) for the full setup: custom collections, roles, social providers, email flows, and protected Next.js routes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

Created by [Benedetto Abbenanti](https://ben.abbenanti.com)
