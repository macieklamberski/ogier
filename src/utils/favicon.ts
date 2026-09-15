import { Resvg } from '@resvg/resvg-js'
import locales from '../locales.json' with { type: 'json' }
import type { ImageRef } from '../types/index.js'
import { loadImage } from './icons.js'

export const faviconSize = 192

// Search engines list ICO, PNG, JPEG and a few older formats for favicons, not SVG.
export const renderFavicon = async (ref: ImageRef, size = faviconSize): Promise<Buffer> => {
  const image = await loadImage(ref)

  if (!('svg' in image)) {
    throw new Error(locales.errors.faviconNeedsSvg)
  }

  return new Resvg(image.svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
}
