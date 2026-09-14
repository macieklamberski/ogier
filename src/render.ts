import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { docsLayout } from './layouts/docs.js'
import { darkTheme } from './themes/dark.js'
import type { Background, Card, Layout, LayoutContext, RenderOptions } from './types/index.js'
import { loadFonts } from './utils/fonts.js'
import { loadIcon, loadImage } from './utils/icons.js'

const resolveLayout = (layout: RenderOptions['layout']): Layout => {
  if (layout === undefined || layout === 'docs') {
    return docsLayout
  }

  return layout
}

const resolveBackground = (background: RenderOptions['background']): Background | undefined => {
  if (background === undefined) {
    return { pattern: 'dots' }
  }

  return background ?? undefined
}

export const renderSvg = async (card: Card, options: RenderOptions = {}): Promise<string> => {
  const layout = resolveLayout(options.layout)
  const sizes: LayoutContext['sizes'] = { ...layout.sizes, ...options.sizes }
  const background = resolveBackground(options.background)
  const { fonts, families } = await loadFonts(options.fonts, layout.weights)
  const context: LayoutContext = {
    card,
    theme: options.theme ?? darkTheme,
    sizes,
    fonts: families,
    logo: options.logo ? await loadIcon(options.logo) : undefined,
    footerIcon: options.footerIcon ? await loadIcon(options.footerIcon) : undefined,
    background,
    backgroundImage:
      background && 'image' in background ? await loadImage(background.image) : undefined,
  }

  return satori(layout.render(context), {
    width: sizes.cardWidth,
    height: sizes.cardHeight,
    fonts,
  })
}

export const renderPng = async (card: Card, options: RenderOptions = {}): Promise<Buffer> => {
  return new Resvg(await renderSvg(card, options)).render().asPng()
}
