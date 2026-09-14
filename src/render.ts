import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { isString } from 'trousse'
import { layouts } from './layouts/index.js'
import { darkTheme } from './themes/dark.js'
import type { Card, Layout, LayoutContext, RenderOptions } from './types/index.js'
import { loadFonts } from './utils/fonts.js'
import { loadIcon, loadImage } from './utils/icons.js'

// U+2011 is the non-breaking hyphen, which the fontsource latin subsets lack.
const nonBreakingHyphenRegex = /\u2011/g
const textKeys = ['name', 'eyebrow', 'title', 'description', 'footer'] as const

const normalizeCard = (card: Card): Card => {
  if (!card.title && !card.description) {
    throw new Error('A card needs a title or a description.')
  }

  const normalized = { ...card }

  for (const key of textKeys) {
    const value = normalized[key]

    if (value) {
      normalized[key] = value.replace(nonBreakingHyphenRegex, '-')
    }
  }

  return normalized
}

const resolveLayout = (layout: RenderOptions['layout'] = 'docs'): Layout => {
  return isString(layout) ? layouts[layout] : layout
}

export const renderSvg = async (card: Card, options: RenderOptions = {}): Promise<string> => {
  const layout = resolveLayout(options.layout)
  const sizes: LayoutContext['sizes'] = { ...layout.sizes, ...options.sizes }
  const { background } = options
  const { fonts, families } = await loadFonts(options.fonts, layout.weights)
  const context: LayoutContext = {
    card: normalizeCard(card),
    theme: options.theme ?? darkTheme,
    sizes,
    fonts: families,
    logo: options.logo ? await loadIcon(options.logo) : undefined,
    footerIcon: options.footerIcon ? await loadIcon(options.footerIcon) : undefined,
    background,
    backgroundImage:
      background && 'image' in background ? await loadImage(background.image) : undefined,
  }

  return satori(layout.render(context), {
    width: sizes.cardWidth,
    height: sizes.cardHeight,
    fonts,
  })
}

export const renderPng = async (card: Card, options: RenderOptions = {}): Promise<Buffer> => {
  return new Resvg(await renderSvg(card, options)).render().asPng()
}
