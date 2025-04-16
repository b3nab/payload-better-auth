import { createElement } from 'react'
import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { docs } from '@/.source'

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(icon): any {
    if (!icon) {
      // You may set a default icon
      return
    }

    // @ts-ignore
    if (icon in icons) return createElement(icons[icon as keyof typeof icons])
  },
})
