import { t } from 'trousse'
import { createElementRenderer, type Loaders, type RenderedElement } from './element.js'
import locales from './locales.json' with { type: 'json' }
import type { Card, Style } from './types/index.js'

// The lite entry reads nothing from disk, so it runs where Node built-ins and native modules
// do not. Fonts come as files and images as SVG markup or data.
const loaders: Loaders = {
  loadFamily: (_key, family) => {
    return Promise.reject(new Error(t(locales.errors.liteFontNeedsFiles, { family })))
  },
  loadFile: (file) => {
    return Promise.reject(
      new Error(t(locales.errors.liteImageNeedsData, { file: file.toString() })),
    )
  },
}

export const createRenderer = (style: Style = {}) => {
  return createElementRenderer(style, loaders)
}

export const renderElement = (card: Card, style?: Style): Promise<RenderedElement> => {
  return createRenderer(style).renderElement(card)
}

export type { RenderedElement } from './element.js'
export { composeMetadata, composeMetaTags, getImageUrl } from './metadata.js'
export type {
  Background,
  Card,
  Extra,
  FontElement,
  FontFile,
  FontRole,
  Fonts,
  IconRef,
  ImageRef,
  Metadata,
  MetadataImage,
  MetadataInput,
  MetaTag,
  Pattern,
  Sizes,
  Slot,
  Style,
  Theme,
} from './types/index.js'
