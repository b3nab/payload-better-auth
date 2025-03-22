# Payload Better Auth Plugin

> ⚠️ **WARNING**: This plugin is currently a Proof of Concept and not ready for production use.

A plugin that integrates [Better Auth](https://www.better-auth.com) with [Payload CMS v3](https://payloadcms.com), providing enhanced authentication capabilities.
This plugin is thought to be used in production, with real users, so to be rock solid. 🗿

## Description

This plugin is a wrapper around the better-auth library. It provides a better-way 🤓 to manage authentication for Payload CMS v3.

The goal is to seamlessly integrate better-auth in your Payload CMS v3 application, providing a robust and feature-rich authentication system with a focus on user experience and developer productivity.

### Why This Plugin?

While Payload CMS comes with a solid and extensible authentication system out of the box, it primarily focuses on basic email/password authentication and API keys. This serves many use cases well, but modern applications often require more sophisticated authentication methods and features.

### Features and TODOs

- [x] Basic integration with better-auth
- [~] Payload Adapter for better-auth database - Needs refinement on `buildWhereClause`
- [~] Collections - Needs refinement on `convertToPayloadFields` and `convertToPayloadType`
- [x] Better Auth API Endpoints
- [~] Payload Collections Auth Endpoints - Needs to replace all remaining payload default auth endpoints
- [~] Auth Strategies - Needs to add strategies for better-auth plugins
- [ ] Documentation
- [~] Tests - Needs more tests and e2e tests

## Important Notes

1. This plugin may perform operations that could affect your application and database
2. Not yet production-ready - use at your own risk
3. Maintainers are not responsible for issues that may occur
4. Contributions via issues and PRs are highly encouraged

### License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE). For commercial licensing options, please contact the maintainer.

## Installation

```bash
pnpm add payload-better-auth
```

## Quick Start

Into your `payload.config.ts` file, add the plugin:

```ts
import { betterAuthPlugin } from 'payload-better-auth'

export default buildConfig({

  // ... other config

  plugins: [
    betterAuthPlugin({
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
      // Plugin options that override the default ones from the plugin
      // betterAuthPlugins: {
      //   twoFactor: true,
      // },
    }),

    // ... other plugins

  ],
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

Created by [Benedetto Abbenanti](https://ben.abbenanti.com)
