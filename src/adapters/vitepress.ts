import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isFunction } from 'trousse'
import type {
  DefaultTheme,
  HeadConfig,
  PageData,
  SiteConfig,
  SiteData,
  TransformContext,
} from 'vitepress'
import { composeMetadata, composeMetaTags, getImageUrl } from '../metadata.js'
import { renderPng } from '../render.js'
import type { Card, Style } from '../types/index.js'

export type VitepressSiteData = SiteData<DefaultTheme.Config>

export type VitepressOptions = {
  site: {
    hostname: string
    imageDir?: string
    imageUrl?: (path: string) => string
  }
  card?: Partial<Card> | ((pageData: PageData, siteData: VitepressSiteData) => Partial<Card>)
  style?: Style
}

type Page = {
  path: string
  card: Card
}

const mdRegex = /\.md$/
const indexRegex = /(^|\/)index$/
const slashRegex = /\//g
const titlePrefixRegex = /^[^:]+:\s*/

const getTrail = (
  items: Array<DefaultTheme.SidebarItem>,
  link: string,
): Array<string> | undefined => {
  for (const item of items) {
    if (item.link === link) {
      return []
    }

    const trail = getTrail(item.items ?? [], link)

    if (trail && item.text) {
      return [item.text, ...trail]
    }
  }
}

const getEyebrow = (sidebar: DefaultTheme.Sidebar | undefined, path: string) => {
  if (!Array.isArray(sidebar)) {
    return
  }

  const trail = getTrail(sidebar, `/${path.replace(indexRegex, '')}`)

  return trail?.join(' › ')
}

export const vitepress = (options: VitepressOptions) => {
  const { site, card: cardOption, style = {} } = options
  const { hostname, imageDir = 'og', imageUrl } = site
  const pages: Array<Page> = []

  const transformHead = (context: TransformContext<DefaultTheme.Config>): Array<HeadConfig> => {
    const { pageData, siteData, description } = context
    const path = pageData.relativePath.replace(mdRegex, '')
    const isHome = path === 'index'
    const title = pageData.title || siteData.title
    const defaults: Card = isHome
      ? { description: siteData.description }
      : {
          eyebrow: getEyebrow(siteData.themeConfig.sidebar, path),
          title: title.replace(titlePrefixRegex, ''),
        }
    const overrides = isFunction(cardOption) ? cardOption(pageData, siteData) : cardOption
    const card: Card = { ...defaults, ...overrides }
    const image = imageUrl ? imageUrl(path) : getImageUrl(hostname, path, imageDir)

    pages.push({ path, card })

    const metadata = composeMetadata({
      url: `${hostname}/${path.replace(indexRegex, '')}`,
      title,
      description,
      image: { url: image, width: style.sizes?.cardWidth, height: style.sizes?.cardHeight },
    })

    return composeMetaTags(metadata)
  }

  const buildEnd = async ({ outDir }: SiteConfig) => {
    const dir = join(outDir, imageDir)

    await mkdir(dir, { recursive: true })

    for (const page of pages) {
      const png = await renderPng(page.card, style)

      await writeFile(join(dir, `${page.path.replace(slashRegex, '-')}.png`), png)
    }
  }

  return { transformHead, buildEnd }
}
