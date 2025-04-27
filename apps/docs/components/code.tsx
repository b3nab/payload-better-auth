import * as Base from 'fumadocs-ui/components/codeblock'
import { highlight } from 'fumadocs-core/highlight'

export interface CodeBlockProps {
  code: string
  wrapper?: Base.CodeBlockProps
  lang: string
}

export async function Code({ code, lang, wrapper }: CodeBlockProps) {
  const rendered = await highlight(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    components: {
      pre: Base.Pre,
    },
  })

  return <Base.CodeBlock {...wrapper}>{rendered}</Base.CodeBlock>
}
