import { defineDocs, defineConfig } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    // fumadocs-mdx applies remarkNpm (fumadocs-core) to ```package-install
    // blocks before any custom remark plugin runs: persistence of the chosen
    // package manager must be configured HERE, not via fumadocs-docgen's
    // remarkInstall, which by then finds no code block left to transform.
    remarkNpmOptions: {
      persist: {
        id: 'persist-install',
      },
    },
  },
})
