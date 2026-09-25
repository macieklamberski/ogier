import { describe, expect, it } from 'bun:test'
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DefaultTheme, HeadConfig, PageData, SiteData, TransformContext } from 'vitepress'
import { vitepress } from './vitepress.js'

const siteData: SiteData<DefaultTheme.Config> = {
  base: '/',
  lang: 'en-US',
  dir: 'ltr',
  title: 'Feedsmith',
  description: 'Fast feed parser.',
  head: [],
  appearance: true,
  themeConfig: {
    sidebar: [{ text: 'Guides', items: [{ text: 'Parsing', link: '/guides/parsing' }] }],
  },
  locales: {},
  router: {
    prefetchLinks: true,
  },
}

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#ff6602" /></svg>'

const getContext = (
  relativePath: string,
  title: string,
): Pick<TransformContext<DefaultTheme.Config>, 'pageData' | 'siteData' | 'description'> => {
  const pageData: PageData = {
    relativePath,
    filePath: relativePath,
    title,
    description: '',
    headers: [],
    frontmatter: {},
  }

  return {
    pageData,
    siteData,
    description: 'Page description.',
  }
}

describe('vitepress', () => {
  const options = {
    site: { hostname: 'https://example.com' },
    card: { header: { text: 'feedsmith' }, footer: { text: 'example/feedsmith' } },
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

  it('should take the image url from the callback when given', () => {
    const value = getContext('index.md', 'Home')
    const imageUrl = (path: string) => `https://cdn.example.com/${path}.png`
    const expected: HeadConfig = [
      'meta',
      { property: 'og:image', content: 'https://cdn.example.com/index.png' },
    ]

    const og = vitepress({ ...options, site: { ...options.site, imageUrl } })

    expect(og.transformHead(value)).toContainEqual(expected)
  })

  it('should emit no icon link without a favicon', () => {
    const value = getContext('index.md', 'Home')

    expect(vitepress(options).transformHead(value)).not.toContainEqual(
      expect.arrayContaining(['link']),
    )
  })

  it('should emit the icon link when a favicon is given', () => {
    const value = getContext('index.md', 'Home')
    const expected: HeadConfig = [
      'link',
      { rel: 'icon', href: '/favicon.png', type: 'image/png', sizes: '192x192' },
    ]
    const og = vitepress({ ...options, site: { ...options.site, favicon: { svg } } })

    expect(og.transformHead(value)).toContainEqual(expected)
  })

  it('should write the favicon png at the output root', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const og = vitepress({ ...options, site: { ...options.site, favicon: { svg, size: 48 } } })

    og.transformHead(getContext('index.md', 'Home'))
    await og.buildEnd({ outDir })

    const png = await readFile(join(outDir, 'favicon.png'))

    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([48, 48])
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
    await og.buildEnd({ outDir })

    expect((await readdir(join(outDir, 'og'))).sort()).toEqual(expected)
  })
})
