import type { Font } from 'satori'
import { getFontWeights, render, resolveSizes } from './layout.js'
import locales from './locales.json' with { type: 'json' }
import { dark } from './themes/dark.js'
import type { Card, Node, RenderContext, Slot, Style } from './types/index.js'
import { type LoadedFonts, type LoadFamily, loadFonts } from './utils/fonts.js'
import { type LoadFile, loadIcon, loadImage } from './utils/images.js'

export type RenderedElement = {
  element: Node & { key: null } // The key types it as the React element ImageResponse takes
  fonts: Array<Font>
  width: number
  height: number
}

// The fonts and image files a style names, read by the entry that has the means to read them.
export type Loaders = {
  loadFamily: LoadFamily
  loadFile: LoadFile
}

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
    ...card,
    header: normalizeSlot(card.header),
    eyebrow: normalizeText(card.eyebrow),
    title: normalizeText(card.title),
    byline: normalizeText(card.byline),
    description: normalizeText(card.description),
    footer: normalizeSlot(card.footer),
  }
}

export const getBackgroundImage = (style: Style) => {
  return style.background && 'image' in style.background ? style.background.image : undefined
}

// The fonts are loaded on the first render and shared by every render after it, so a site
// renders its pages through one renderer. Icons and images are loaded per render.
export const createElementRenderer = (style: Style, loaders: Loaders) => {
  const sizes = resolveSizes(style.sizes)
  const { background } = style
  const backgroundImage = getBackgroundImage(style)
  const { loadFamily, loadFile } = loaders
  let loadedFonts: Promise<LoadedFonts> | undefined

  // A failed load is dropped from the cache, so one read error does not fail every later render.
  const loadFontsOnce = async () => {
    try {
      return await loadFonts(style.fonts, getFontWeights(sizes), loadFamily)
    } catch (error) {
      loadedFonts = undefined
      throw error
    }
  }

  const renderElement = async (card: Card): Promise<RenderedElement> => {
    if (!loadedFonts) {
      loadedFonts = loadFontsOnce()
    }

    const { fonts, families } = await loadedFonts
    const context: RenderContext = {
      card: normalizeCard(card),
      theme: style.theme ?? dark,
      sizes,
      fonts: families,
      headerIcon: card.header?.icon ? await loadIcon(card.header.icon, loadFile) : undefined,
      icon: card.icon ? await loadIcon(card.icon, loadFile) : undefined,
      footerIcon: card.footer?.icon ? await loadIcon(card.footer.icon, loadFile) : undefined,
      image: card.image ? await loadImage(card.image, loadFile) : undefined,
      background,
      backgroundImage: backgroundImage ? await loadImage(backgroundImage, loadFile) : undefined,
    }

    return {
      element: { ...render(context), key: null },
      fonts,
      width: sizes.cardWidth,
      height: sizes.cardHeight,
    }
  }

  return { renderElement }
}
