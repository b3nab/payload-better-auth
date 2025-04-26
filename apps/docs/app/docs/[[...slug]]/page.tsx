import { source } from '@/lib/source'
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Banner } from 'fumadocs-ui/components/banner'
import { GithubInfo } from 'fumadocs-ui/components/github-info'
import { notFound, redirect } from 'next/navigation'
import defaultMdxComponents, { createRelativeLink } from 'fumadocs-ui/mdx'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom'
// import { Accordion, Accordions } from '@/components/accordion'
// import { Banner } from '@/components/banner'
// import { GithubInfo } from '@/components/github-info'
import Link from 'next/link'
// import { Step, Steps } from '@/components/steps'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const latestVersion = publicRuntimeConfig.latestVersion

const needToResolveLatest = (params: { slug?: string[] }) => {
  if (params.slug?.[0] === 'latest')
    redirect(`/docs/${[latestVersion, params.slug?.slice(1)].join('/')}`)
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  needToResolveLatest(params)
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDXContent = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={{
            ...defaultMdxComponents,
            img: (props) => <ImageZoom {...(props as any)} />,
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
            // you can add other MDX components here
            Tab,
            Tabs,
            Accordion,
            Accordions,
            Banner,
            GithubInfo,
            Link,
            Step,
            Steps,
          }}
        />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
