import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { isString } from 'trousse'
import { layouts } from './layouts/index.js'
import locales from './locales.json' with { type: 'json' }
import { darkTheme } from './themes/dark.js'
import type { Card, Layout, LayoutContext, Slot, Style } from './types/index.js'
import { loadFonts } from './utils/fonts.js'
import { loadIcon, loadImage } from './utils/icons.js'

// U+2011 is the non-breaking hyphen, which the fontsource latin subsets lack.
const nonBreakingHyphenRegex = /‑/g

const normalizeText = (text: string | undefined) => {
  return text?.replace(nonBreakingHyphenRegex, '-')
}

const normalizeSlot = (slot: Slot | undefined): Slot | undefined => {
  return slot && { ...slot, text: normalizeText(slot.text) ?? '' }
}

const normalizeCard = (card: Card): Card => {
  if (!card.title && !card.description) {
    throw new Error(locales.errors.cardNeedsText)
  }

  return {
    header: normalizeSlot(card.header),
    eyebrow: normalizeText(card.eyebrow),
    title: normalizeText(card.title),
    description: normalizeText(card.description),
    footer: normalizeSlot(card.footer),
  }
}

const resolveLayout = (layout: Style['layout'] = 'docs'): Layout => {
  return isString(layout) ? layouts[layout] : layout
}

export const renderSvg = async (card: Card, style: Style = {}): Promise<string> => {
  const layout = resolveLayout(style.layout)
  const sizes: LayoutContext['sizes'] = { ...layout.sizes, ...style.sizes }
  const { background } = style
  const { fonts, families } = await loadFonts(style.fonts, layout.weights)
  const context: LayoutContext = {
    card: normalizeCard(card),
    theme: style.theme ?? darkTheme,
    sizes,
    fonts: families,
    headerIcon: card.header?.icon ? await loadIcon(card.header.icon) : undefined,
    footerIcon: card.footer?.icon ? await loadIcon(card.footer.icon) : undefined,
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

export const renderPng = async (card: Card, style: Style = {}): Promise<Buffer> => {
  return new Resvg(await renderSvg(card, style)).render().asPng()
}
