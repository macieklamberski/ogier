import { resolveSizes } from '../layout.js'
import { createRenderer } from '../render.js'
import type { Card, Style } from '../types/index.js'

export type NextParams = Record<string, string | Array<string>>

export type NextImageProps = {
  params: Promise<NextParams>
}

export type NextResolve = (params: NextParams) => Card | Promise<Card>

export type NextOptions = {
  style?: Style
  card: NextResolve
  headers?: HeadersInit
}

export type NextImage = {
  default: (props: NextImageProps) => Promise<Response>
  size: { width: number; height: number }
  contentType: 'image/png'
}

type Next = {
  (options: NextOptions): NextImage
  /** @deprecated Use `next({ style, card })` instead. */
  (style: Style, resolve: NextResolve): NextImage
}

const getOptions = (value: NextOptions | Style, resolve: NextResolve | undefined): NextOptions => {
  if (resolve) {
    return { style: value as Style, card: resolve }
  }

  return value as NextOptions
}

// The image file exports the returned `default`, `size` and `contentType`, and Next writes the
// Open Graph tags from them. The params arrive as a promise in Next 15 and later.
export const next: Next = (value: NextOptions | Style, resolve?: NextResolve) => {
  const { style = {}, card, headers } = getOptions(value, resolve)
  const renderer = createRenderer(style)
  const sizes = resolveSizes(style.sizes)

  const image = async ({ params }: NextImageProps): Promise<Response> => {
    const png = await renderer.renderPng(await card(await params))
    const responseHeaders = new Headers(headers)

    // The body is always a PNG, so a caller's Content-Type never reaches the response.
    responseHeaders.set('Content-Type', 'image/png')

    return new Response(new Uint8Array(png), { headers: responseHeaders })
  }

  return {
    default: image,
    size: { width: sizes.cardWidth, height: sizes.cardHeight },
    contentType: 'image/png',
  }
}
