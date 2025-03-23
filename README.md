<p align="center">
  <picture>
    <source srcset="./banner-dark.png" media="(prefers-color-scheme: dark)">
    <source srcset="./banner.png" media="(prefers-color-scheme: light)">
    <img src="./banner.png" alt="Banner">
  </picture>
  <h2 align="center">
    Payload Better Auth Plugin
  </h2>

  <p align="center">
    You are one plugin away to revolutionize your PayloadCMS's auth.
  <!-- The most comprehensive authentication library for TypeScript -->
    <br />
    <a href="https://payload-better-auth.abbenanti.com"><strong>Learn more »</strong></a>
    <br />
    <br />
    <!-- <a href="https://discord.com/invite/GYC3W7tZzb">Discord</a> -->
    <!-- · -->
    <a href="https://payload-better-auth.abbenanti.com/docs">Docs</a>
    ·
    <a href="https://github.com/b3nab/payload-better-auth/issues">Issues</a>
  </p>

[![npm](https://img.shields.io/npm/dm/payload-better-auth)](https://npm.chart.dev/payload-better-auth?primary=neutral&gray=neutral&theme=dark)
[![npm version](https://img.shields.io/npm/v/payload-better-auth.svg)](https://www.npmjs.com/package/payload-better-auth)
[![GitHub stars](https://img.shields.io/github/stars/b3nab/payload-better-auth)](https://github.com/b3nab/payload-better-auth/stargazers)

</p>

<!-- # Payload Better Auth Plugin -->

> ⚠️ **WARNING**: This plugin is currently a WIP and not yet totally ready.
> I mean, I'm using it in production, but it's not yet public available.
> If you want a preview access to the plugin, you should contact the author (in private) and request an access token for the private npm registry.

A plugin that integrates [Better Auth](https://www.better-auth.com) with [Payload CMS v3](https://payloadcms.com), providing enhanced authentication capabilities.
This plugin is thought to be used in production, with real users, so to be rock solid. 🗿

## Description

This plugin is a wrapper around the better-auth library. It provides a better-way 🤓 to manage authentication for Payload CMS v3.

The goal is to seamlessly integrate better-auth in your Payload CMS v3 application, providing a robust and feature-rich authentication system with a focus on user experience and developer productivity.

### Why This Plugin?

While Payload CMS comes with a solid and extensible authentication system out of the box, it primarily focuses on basic email/password authentication and API keys. This serves many use cases well, but modern applications often require more sophisticated authentication methods and features.

### Features and TODOs

- [x] Integration with better-auth
- [x] Extend and customize better-auth collections with additional fields
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

## Installation

```bash
pnpm add payload-better-auth
```

## Quick Start

Into your `payload.config.ts` file, add the plugin:

```ts
import { betterAuthPlugin } from "payload-better-auth";

export default buildConfig({
  // ... other config

  plugins: [
    betterAuthPlugin({
      // Better Auth Config. https://www.better-auth.com/docs/reference/options
      betterAuth: {
        // used by two factor plugin as an issuer and other things
        appName: "My App",
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
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

Created by [Benedetto Abbenanti](https://ben.abbenanti.com)
