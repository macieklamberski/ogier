import { resolveSizes } from '../layout.js'
import { createRenderer } from '../render.js'
import type { Card, Style } from '../types/index.js'

export type NextParams = Record<string, string | Array<string>>

export type NextImageProps = {
  params: Promise<NextParams>
}

export type NextResolve = (params: NextParams) => Card | Promise<Card>

export type NextOptions = {
  headers?: HeadersInit
}

// The image file exports the returned `default`, `size` and `contentType`, and Next writes the
// Open Graph tags from them. The params arrive as a promise in Next 15 and later.
export const next = (style: Style, resolve: NextResolve, options: NextOptions = {}) => {
  const renderer = createRenderer(style)
  const sizes = resolveSizes(style.sizes)

  const image = async ({ params }: NextImageProps): Promise<Response> => {
    const card = await resolve(await params)
    const png = await renderer.renderPng(card)

    const headers = new Headers(options.headers)

    // The body is always a PNG, so a caller's Content-Type never reaches the response.
    headers.set('Content-Type', 'image/png')

    return new Response(new Uint8Array(png), { headers })
  }

  return {
    default: image,
    size: { width: sizes.cardWidth, height: sizes.cardHeight },
    contentType: 'image/png',
  }
}
