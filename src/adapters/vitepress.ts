import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  DefaultTheme,
  HeadConfig,
  PageData,
  SiteConfig,
  SiteData,
  TransformContext,
} from 'vitepress'
import { getImageUrl, getMetadata, toMetaTags } from '../metadata.js'
import { renderPng } from '../render.js'
import type { Card, IconRef, RenderOptions } from '../types/index.js'

export type VitepressOptions = Omit<RenderOptions, 'footerIcon'> & {
  hostname: string
  name: string
  footer?: { icon?: IconRef; text?: string }
  imageDir?: string
  imageUrl?: (path: string) => string
  card?: (pageData: PageData, siteData: SiteData<DefaultTheme.Config>) => Partial<Card>
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
  const {
    hostname,
    name,
    footer,
    imageDir = 'og',
    imageUrl,
    card: getCardOverrides,
    ...renderOptions
  } = options
  const pages: Array<Page> = []

  const transformHead = (context: TransformContext<DefaultTheme.Config>): Array<HeadConfig> => {
    const { pageData, siteData, description } = context
    const path = pageData.relativePath.replace(mdRegex, '')
    const isHome = path === 'index'
    const title = pageData.title || name
    const defaults: Card = isHome
      ? { name, description: siteData.description, footer: footer?.text }
      : {
          name,
          eyebrow: getEyebrow(siteData.themeConfig.sidebar, path),
          title: title.replace(titlePrefixRegex, ''),
          footer: footer?.text,
        }
    const card: Card = { ...defaults, ...getCardOverrides?.(pageData, siteData) }
    const image = imageUrl ? imageUrl(path) : getImageUrl(hostname, path, imageDir)

    pages.push({ path, card })

    const metadata = getMetadata({
      url: `${hostname}/${path.replace(indexRegex, '')}`,
      title,
      description,
      image: {
        url: image,
        width: renderOptions.sizes?.cardWidth,
        height: renderOptions.sizes?.cardHeight,
      },
    })

    return toMetaTags(metadata)
  }

  const buildEnd = async ({ outDir }: SiteConfig) => {
    const dir = join(outDir, imageDir)

    await mkdir(dir, { recursive: true })

    for (const page of pages) {
      const png = await renderPng(page.card, { ...renderOptions, footerIcon: footer?.icon })

      await writeFile(join(dir, `${page.path.replace(slashRegex, '-')}.png`), png)
    }
  }

  return { transformHead, buildEnd }
}
