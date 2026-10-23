import satori, { type Font } from 'satori'
import { t } from 'trousse'
import { getFontWeights, render, resolveSizes } from './layout.js'
import locales from './locales.json' with { type: 'json' }
import { dark } from './themes/dark.js'
import type { Card, ImageRef, Node, RenderContext, Slot, Style } from './types/index.js'
import { type LoadedFonts, loadFonts } from './utils/fonts.js'
import { getExtension, loadIcon, loadImage } from './utils/icons.js'

// U+2011 is the non-breaking hyphen, which the fontsource latin subsets lack.
const nonBreakingHyphenRegex = /‑/g

// resvg has no WebP decoder and drops the image from the PNG without an error, so a WebP image
// is rejected before the render.
const findWebpFile = (refs: Array<ImageRef | undefined>) => {
  for (const ref of refs) {
    if (ref && 'file' in ref && getExtension(ref.file) === '.webp') {
      return ref.file.toString()
    }
  }
}

export type RenderedElement = {
  element: Node & { key: null } // The key types it as the React element ImageResponse takes
  fonts: Array<Font>
  width: number
  height: number
}

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
    icon: card.icon,
    eyebrow: normalizeText(card.eyebrow),
    title: normalizeText(card.title),
    byline: normalizeText(card.byline),
    description: normalizeText(card.description),
    footer: normalizeSlot(card.footer),
    image: card.image,
    align: card.align,
    extra: card.extra,
  }
}

// The fonts are read from disk on the first render and shared by every render after it, so a
// site renders its pages through one renderer. Icons and images are read per render.
export const createRenderer = (style: Style = {}) => {
  const sizes = resolveSizes(style.sizes)
  const { background } = style
  const backgroundImage = background && 'image' in background ? background.image : undefined
  let loadedFonts: Promise<LoadedFonts> | undefined

  // A failed load is dropped from the cache, so one read error does not fail every later render.
  const loadFontsOnce = async () => {
    try {
      return await loadFonts(style.fonts, getFontWeights(sizes))
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
      headerIcon: card.header?.icon ? await loadIcon(card.header.icon) : undefined,
      icon: card.icon ? await loadIcon(card.icon) : undefined,
      footerIcon: card.footer?.icon ? await loadIcon(card.footer.icon) : undefined,
      image: card.image ? await loadImage(card.image) : undefined,
      background,
      backgroundImage: backgroundImage ? await loadImage(backgroundImage) : undefined,
    }

    return {
      element: { ...render(context), key: null },
      fonts,
      width: sizes.cardWidth,
      height: sizes.cardHeight,
    }
  }

  const renderSvg = async (card: Card): Promise<string> => {
    const { element, fonts, width, height } = await renderElement(card)

    return satori(element, { width, height, fonts })
  }

  const renderPng = async (card: Card): Promise<Buffer> => {
    const webpFile = findWebpFile([
      card.image,
      card.icon,
      card.header?.icon,
      card.footer?.icon,
      backgroundImage,
    ])

    if (webpFile) {
      throw new Error(t(locales.errors.webpInPng, { file: webpFile }))
    }

    const svg = await renderSvg(card)

    // Loaded on first use: runtimes without native modules, such as Cloudflare Workers, can then
    // import ogier for renderElement.
    const { Resvg } = await import('@resvg/resvg-js')

    return new Resvg(svg).render().asPng()
  }

  return { renderElement, renderSvg, renderPng }
}

export const renderElement = (card: Card, style?: Style): Promise<RenderedElement> => {
  return createRenderer(style).renderElement(card)
}

export const renderSvg = (card: Card, style?: Style): Promise<string> => {
  return createRenderer(style).renderSvg(card)
}

export const renderPng = (card: Card, style?: Style): Promise<Buffer> => {
  return createRenderer(style).renderPng(card)
}
