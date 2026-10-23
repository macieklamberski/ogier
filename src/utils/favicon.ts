import locales from '../locales.json' with { type: 'json' }
import type { ImageRef } from '../types/index.js'
import { loadImage } from './icons.js'
import { toDataUri } from './images.js'

export const faviconSize = 192

// Search engines list ICO, PNG, JPEG and a few older formats for favicons, not SVG.
export const renderFavicon = async (ref: ImageRef, size = faviconSize): Promise<Buffer> => {
  const image = await loadImage(ref)

  if (!('svg' in image)) {
    throw new Error(locales.errors.faviconNeedsSvg)
  }

  const { Resvg } = await import('@resvg/resvg-js')

  const resvg = new Resvg(image.svg, { fitTo: { mode: 'width', value: size } })

  if (resvg.width === resvg.height) {
    return resvg.render().asPng()
  }

  // The image element scales the SVG to fit the square and centres it.
  const href = toDataUri(image.svg, 'image/svg+xml')
  const square = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image width="${size}" height="${size}" href="${href}" /></svg>`

  return new Resvg(square).render().asPng()
}
