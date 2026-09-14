import { describe, expect, it } from 'bun:test'
import { mkdtemp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type {
  DefaultTheme,
  HeadConfig,
  PageData,
  SiteConfig,
  SiteData,
  TransformContext,
} from 'vitepress'
import { vitepress } from './vitepress.js'

const siteData = {
  description: 'Fast feed parser.',
  themeConfig: {
    sidebar: [{ text: 'Guides', items: [{ text: 'Parsing', link: '/guides/parsing' }] }],
  },
} as SiteData<DefaultTheme.Config>

const getContext = (relativePath: string, title: string) => {
  const pageData = { relativePath, title } as PageData

  return {
    pageData,
    siteData,
    description: 'Page description.',
  } as TransformContext<DefaultTheme.Config>
}

describe('vitepress', () => {
  const options = {
    hostname: 'https://example.com',
    name: 'feedsmith',
    footer: { text: 'example/feedsmith' },
  }

  it('should emit the tags pointing at the page and its image', () => {
    const value = getContext('guides/parsing.md', 'Guides: Parsing')
    const expected: Array<HeadConfig> = [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:url', content: 'https://example.com/guides/parsing' }],
      ['meta', { property: 'og:title', content: 'Guides: Parsing' }],
      ['meta', { property: 'og:description', content: 'Page description.' }],
      ['meta', { property: 'og:image', content: 'https://example.com/og/guides-parsing.png' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: 'Guides: Parsing' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: 'Guides: Parsing' }],
      ['meta', { name: 'twitter:description', content: 'Page description.' }],
      ['meta', { name: 'twitter:image', content: 'https://example.com/og/guides-parsing.png' }],
    ]

    expect(vitepress(options).transformHead(value)).toEqual(expected)
  })

  it('should write one png per page under the image dir', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const card = (pageData: PageData) => ({
      eyebrow: pageData.relativePath === 'index.md' ? undefined : 'Custom',
    })
    const og = vitepress({ ...options, card })
    const expected = ['guides-parsing.png', 'index.png']

    og.transformHead(getContext('index.md', 'Home'))
    og.transformHead(getContext('guides/parsing.md', 'Guides: Parsing'))
    await og.buildEnd({ outDir } as SiteConfig)

    expect((await readdir(join(outDir, 'og'))).sort()).toEqual(expected)
  })
})
