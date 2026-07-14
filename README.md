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
    You are one plugin away from revolutionizing your Payload CMS auth.
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

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/b3nab/payload-better-auth)
[![GitHub stars](https://img.shields.io/github/stars/b3nab/payload-better-auth)](https://github.com/b3nab/payload-better-auth/stargazers)
[![npm version](https://img.shields.io/npm/v/@b3nab/payload-better-auth.svg)](https://www.npmjs.com/package/@b3nab/payload-better-auth)
[![npm](https://img.shields.io/npm/dm/@b3nab/payload-better-auth)](https://npm.chart.dev/@b3nab/payload-better-auth?primary=neutral&gray=neutral&theme=dark)

</p>

<!-- # Payload Better Auth Plugin -->

A plugin that integrates [Better Auth](https://www.better-auth.com) with
[Payload CMS v3](https://payloadcms.com), providing enhanced authentication
capabilities. This plugin is thought to be used in production, with real users,
so to be rock solid well tested and reliable. 🗿

## Description

The `@b3nab/payload-better-auth` plugin wraps the better-auth library to
seamlessly integrate advanced authentication features into Payload CMS v3. It
enhances developer productivity and user experience by offering more
sophisticated authentication methods beyond Payload's built-in auth system.
Definitely it's a better-way 🤓 to manage authentication for Payload CMS v3.

### Why This Plugin?

While Payload CMS comes with a solid and extensible authentication system out of
the box, it primarily focuses on basic email/password authentication and API
keys. This serves many use cases well, but modern applications often require
more sophisticated authentication methods and features.

### Features

The goal is to seamlessly integrate better-auth in your Payload CMS v3
application, providing a robust and feature-rich authentication system with a
focus on user experience and developer productivity.

- **Basic integration - Out of the box 🤝**
  - Integration with Better Auth
  - Automatic Collections creation
  - Automatic Better Auth API Endpoints creation
  - Payload Adapter as Better Auth database, with transactions, joins, and
    automatic cleanup of dependent records on delete
- **Better Integration 🤓**
  - 2FA TOTP-based for Admin Panel
  - Social login buttons auto-injected into the admin login screen
  - Default email verification and password reset flows (overridable)
  - Easily extend Collections using Payload-like collection's config
  - `payload.betterAuth` instance, fully typed with your own plugin options
  - Auth layer helpers for Next.js (checkers, guards)

## Installation

Install the plugin and its peer dependencies:

```bash
pnpm add @b3nab/payload-better-auth better-auth better-auth-harmony
```

## Quick Start

Create the plugin config in its own file:

```ts
// lib/payload-better-auth.config.ts
import { defineBetterAuthPluginOptions } from "@b3nab/payload-better-auth";

export const payloadBetterAuthConfig = defineBetterAuthPluginOptions({
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
});

// makes payload.betterAuth fully typed with YOUR options, everywhere
declare module "@b3nab/payload-better-auth" {
  interface PayloadBetterAuthRegister {
    pluginOptions: typeof payloadBetterAuthConfig;
  }
}
```

Then add the plugin to your `payload.config.ts` file:

```ts
import { buildConfig } from "payload";
import { betterAuthPlugin } from "@b3nab/payload-better-auth";
import { payloadBetterAuthConfig } from "./lib/payload-better-auth.config";

export default buildConfig({
  // ... other config

  plugins: [betterAuthPlugin(payloadBetterAuthConfig)],
  // ... other config
});
```

See the [docs](https://payload-better-auth.abbenanti.com/docs) for the full
setup: custom collections, roles, social providers, email flows, and protected
Next.js routes.

## Important Notes

1. This plugin may perform operations that could affect your application and
   database
2. Maintainers are not responsible for issues that may occur
3. Contributions via issues and PRs are highly encouraged

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

Created and maintained by [Benedetto Abbenanti](https://ben.abbenanti.com).

This project would not be possible without the following open-source projects:

- [Better Auth](https://better-auth.com)
- [Payload CMS](https://payloadcms.com)
