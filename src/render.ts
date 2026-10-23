import satori from 'satori'
import { t } from 'trousse'
import {
  createElementRenderer,
  getBackgroundImage,
  type Loaders,
  type RenderedElement,
} from './element.js'
import locales from './locales.json' with { type: 'json' }
import type { Card, IconRef, ImageRef, Style } from './types/index.js'
import { loadFontsourceFamily } from './utils/fontsource.js'
import { getExtension, loadImageFile } from './utils/icons.js'

export type { RenderedElement } from './element.js'

const loaders: Loaders = { loadFamily: loadFontsourceFamily, loadFile: loadImageFile }

// resvg has no WebP decoder and drops the image from the PNG without an error, so a WebP image
// is rejected before the render.
const findWebpFile = (refs: Array<ImageRef | IconRef | undefined>) => {
  for (const ref of refs) {
    if (ref && 'file' in ref && getExtension(ref.file) === '.webp') {
      return ref.file.toString()
    }
  }
}

export const createRenderer = (style: Style = {}) => {
  const { renderElement } = createElementRenderer(style, loaders)
  const backgroundImage = getBackgroundImage(style)

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
