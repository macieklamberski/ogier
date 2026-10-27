import type { MaybePromise } from 'trousse'
import { resolveSizes } from '../layout.js'
import { createRenderer } from '../render.js'
import type { Card, Style } from '../types/index.js'

export type NextParams = Record<string, string | Array<string>>

export type NextImageProps = {
  params: Promise<NextParams>
}

export type NextResolve = (params: NextParams) => MaybePromise<Card>

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

type NextArguments = [options: NextOptions] | [style: Style, resolve: NextResolve]

const getOptions = (args: NextArguments): NextOptions => {
  if (args.length === 2) {
    return { style: args[0], card: args[1] }
  }

  return args[0]
}

// The image file exports the returned `default`, `size` and `contentType`, and Next writes the
// Open Graph tags from them. The params arrive as a promise in Next 15 and later.
export const next: Next = (...args: NextArguments) => {
  const { style = {}, card, headers } = getOptions(args)
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
