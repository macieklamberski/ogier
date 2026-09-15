import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { defaultSizes, fontWeights, render } from './layout.js'
import locales from './locales.json' with { type: 'json' }
import { dark } from './themes/dark.js'
import type { Card, RenderContext, Sizes, Slot, Style } from './types/index.js'
import { loadFonts } from './utils/fonts.js'
import { loadIcon, loadImage } from './utils/icons.js'

// U+2011 is the non-breaking hyphen, which the fontsource latin subsets lack.
const nonBreakingHyphenRegex = /‑/g

const normalizeText = (text: string | undefined) => {
  return text?.replace(nonBreakingHyphenRegex, '-')
}

const normalizeSlot = (slot: Slot | undefined): Slot | undefined => {
  if (!slot) {
    return
  }

  return {
    ...slot,
    text: normalizeText(slot.text),
    aside: normalizeText(slot.aside),
  }
}

const normalizeCard = (card: Card): Card => {
  if (!card.title && !card.description) {
    throw new Error(locales.errors.cardNeedsText)
  }

  return {
    header: normalizeSlot(card.header),
    eyebrow: normalizeText(card.eyebrow),
    title: normalizeText(card.title),
    byline: normalizeText(card.byline),
    description: normalizeText(card.description),
    footer: normalizeSlot(card.footer),
    image: card.image,
    align: card.align,
  }
}

export const renderSvg = async (card: Card, style: Style = {}): Promise<string> => {
  const sizes: Sizes = { ...defaultSizes, ...style.sizes }
  const { background } = style
  const { fonts, families } = await loadFonts(style.fonts, fontWeights)
  const context: RenderContext = {
    card: normalizeCard(card),
    theme: style.theme ?? dark,
    sizes,
    fonts: families,
    headerIcon: card.header?.icon ? await loadIcon(card.header.icon) : undefined,
    footerIcon: card.footer?.icon ? await loadIcon(card.footer.icon) : undefined,
    image: card.image ? await loadImage(card.image) : undefined,
    background,
    backgroundImage:
      background && 'image' in background ? await loadImage(background.image) : undefined,
  }

  return satori(render(context), {
    width: sizes.cardWidth,
    height: sizes.cardHeight,
    fonts,
  })
}

export const renderPng = async (card: Card, style: Style = {}): Promise<Buffer> => {
  return new Resvg(await renderSvg(card, style)).render().asPng()
}
