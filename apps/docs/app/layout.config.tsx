// import { GithubInfo } from 'fumadocs-ui/components/github-info'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { DiffIcon, HomeIcon } from 'lucide-react'

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        {/* <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo"
        >
          <circle cx={12} cy={12} r={12} fill="currentColor" />
        </svg> */}
        <DiffIcon />
        Payload Better Auth
      </>
    ),
  },
  links: [
    {
      // type: 'button',
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
      on: 'nav',
    },
    // {
    //   type: 'custom',
    //   children: (
    //     <GithubInfo
    //       owner="b3nab"
    //       repo="payload-better-auth"
    //       className="lg:-mx-2"
    //     />
    //   ),
    // },
    // {
    //   type: 'main',
    //   text: '♥️ Support',
    //   url: '/docs',
    //   // active: 'nested-url',
    // },
    // {
    //   type: 'button',
    //   url: '/',
    //   text: 'My Home',
    // },
    // {
    //   type: 'icon',
    //   icon: <HomeIcon />,
    //   url: '/',
    //   text: 'My Home',
    // },
    {
      type: 'icon',
      icon: <>{`Support <♥️/>`}</>,
      url: '/',
      text: 'My Home',
    },
  ],
}
