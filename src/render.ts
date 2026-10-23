import satori, { type Font } from 'satori'
import { t } from 'trousse'
import { getFontWeights, render, resolveSizes } from './layout.js'
import locales from './locales.json' with { type: 'json' }
import { dark } from './themes/dark.js'
import type { Card, ImageRef, Node, RenderContext, Slot, Style } from './types/index.js'
import { type LoadedFonts, loadFonts } from './utils/fonts.js'
import { loadIcon, loadImage } from './utils/icons.js'

export type RenderedElement = {
  element: Node & { key: null } // The key types it as the React element ImageResponse takes
  fonts: Array<Font>
  width: number
  height: number
}

// U+2011 is the non-breaking hyphen, which the fontsource latin subsets lack.
const nonBreakingHyphenRegex = /‑/g

const webpRegex = /\.webp$/i

// resvg has no WebP decoder and drops the image from the PNG without an error, so a WebP image
// is rejected before the render.
const findWebpFile = (refs: Array<ImageRef | undefined>) => {
  for (const ref of refs) {
    const file = ref && 'file' in ref ? ref.file.toString() : undefined

    if (file && webpRegex.test(file)) {
      return file
    }
  }
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
    ...card,
    header: normalizeSlot(card.header),
    eyebrow: normalizeText(card.eyebrow),
    title: normalizeText(card.title),
    byline: normalizeText(card.byline),
    description: normalizeText(card.description),
    footer: normalizeSlot(card.footer),
  }
}

// The fonts are read from disk on the first render and shared by every render after it, so a
// site renders its pages through one renderer. Icons and images are read per render.
export const createRenderer = (style: Style = {}) => {
  const sizes = resolveSizes(style.sizes)
  const { background } = style
  const backgroundImage = background && 'image' in background ? background.image : undefined
  let loadedFonts: Promise<LoadedFonts> | undefined

  const renderElement = async (card: Card): Promise<RenderedElement> => {
    loadedFonts ??= loadFonts(style.fonts, getFontWeights(sizes))

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
    const webpFile = findWebpFile([card.image, backgroundImage])

    if (webpFile) {
      throw new Error(t(locales.errors.webpInPng, { file: webpFile }))
    }

    const svg = await renderSvg(card)

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
