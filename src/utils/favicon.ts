import locales from '../locales.json' with { type: 'json' }
import type { ImageRef } from '../types/index.js'
import { loadImage, toDataUri } from './icons.js'

export const faviconSize = 192

// Search engines list ICO, PNG, JPEG and a few older formats for favicons, not SVG.
export const renderFavicon = async (ref: ImageRef, size = faviconSize): Promise<Buffer> => {
  const image = await loadImage(ref)

  if (!('svg' in image)) {
    throw new Error(locales.errors.faviconNeedsSvg)
  }

  const { Resvg } = await import('@resvg/resvg-js')

  // biome-ignore lint/correctness/noUnusedInstantiation: The parse throws for invalid SVG, which the image element draws blank.
  new Resvg(image.svg)

  // The image element scales the SVG to fit the square and centres it.
  const href = toDataUri(image.svg, 'image/svg+xml')
  const square = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image width="${size}" height="${size}" href="${href}" /></svg>`

  return new Resvg(square).render().asPng()
}
