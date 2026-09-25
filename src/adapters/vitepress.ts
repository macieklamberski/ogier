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
import { createRenderer } from '../render.js'
import type { Card, ImageRef, Style } from '../types/index.js'
import { faviconSize, renderFavicon } from '../utils/favicon.js'

export type VitepressSiteData = SiteData<DefaultTheme.Config>

export type VitepressOptions = {
  site: {
    hostname: string
    imageDir?: string
    imageUrl?: (path: string) => string
    favicon?: ImageRef & { size?: number }
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
  const { hostname, imageDir = 'og', imageUrl, favicon } = site
  const faviconFile = 'favicon.png'
  const pages: Array<Page> = []
  const renderer = createRenderer(style)

  const transformHead = (
    context: Pick<TransformContext<DefaultTheme.Config>, 'pageData' | 'siteData' | 'description'>,
  ): Array<HeadConfig> => {
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

    const tags: Array<HeadConfig> = composeMetaTags(metadata)

    if (favicon) {
      const sizes = `${favicon.size ?? faviconSize}x${favicon.size ?? faviconSize}`

      tags.push([
        'link',
        { rel: 'icon', href: `${siteData.base}${faviconFile}`, type: 'image/png', sizes },
      ])
    }

    return tags
  }

  const buildEnd = async ({ outDir }: Pick<SiteConfig, 'outDir'>) => {
    const dir = join(outDir, imageDir)

    await mkdir(dir, { recursive: true })

    if (favicon) {
      await writeFile(join(outDir, faviconFile), await renderFavicon(favicon, favicon.size))
    }

    for (const page of pages) {
      const png = await renderer.renderPng(page.card)

      await writeFile(join(dir, `${page.path.replace(slashRegex, '-')}.png`), png)
    }
  }

  return { transformHead, buildEnd }
}
