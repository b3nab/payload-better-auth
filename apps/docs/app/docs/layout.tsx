import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/notebook'
import type { ReactNode } from 'react'
import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  links: baseOptions.links,
  // ?.filter((link) =>
  //   link.on ? link.on !== 'nav' : true,
  // ),
}

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...docsOptions}>{children}</DocsLayout>
}
