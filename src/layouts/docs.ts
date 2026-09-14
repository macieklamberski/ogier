import type { Icon, Layout, LayoutContext, Node, Sizes } from '../types/index.js'

export type DocsSizes = Sizes & {
  cardPadding: string
  logoTile: number
  logoText: number
  eyebrowText: number
  titleText: number
  titleTextLong: number
  titleTextLongest: number
  titleLongLength: number
  titleLongestLength: number
  titleMaxLines: number
  titleMaxLinesWithDescription: number
  descriptionText: number
  descriptionMaxLines: number
  footerIcon: number
  footerText: number
  railWidth: number
  railDotStep: number
  railDotRadius: number
}

type DocsContext = LayoutContext & {
  sizes: DocsSizes
}

export const docsSizes: DocsSizes = {
  cardWidth: 1200,
  cardHeight: 630,
  cardPadding: '56px 400px 56px 64px',
  logoTile: 56,
  logoText: 44,
  eyebrowText: 26,
  titleText: 72,
  titleTextLong: 56,
  titleTextLongest: 44,
  titleLongLength: 40,
  titleLongestLength: 90,
  titleMaxLines: 3,
  titleMaxLinesWithDescription: 2,
  descriptionText: 30,
  descriptionMaxLines: 2,
  footerIcon: 32,
  footerText: 28,
  railWidth: 600,
  railDotStep: 24,
  railDotRadius: 2,
}

const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => {
  return { type, props: { style, children } }
}

const renderIcon = (icon: Icon, size: number): Node => {
  if ('src' in icon) {
    return { type: 'img', props: { src: icon.src, width: size, height: size } }
  }

  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      children: icon.children,
    },
  }
}

const renderLogo = (context: DocsContext): Node => {
  const { card, fonts, logo, sizes } = context

  return h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
    logo ? renderIcon(logo, sizes.logoTile) : undefined,
    h('div', { fontFamily: fonts.label, fontSize: sizes.logoText }, card.name),
  ])
}

const renderEyebrow = (context: DocsContext, eyebrow: string): Node => {
  const style = {
    fontFamily: context.fonts.label,
    fontSize: context.sizes.eyebrowText,
    color: context.theme.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  }

  return h('div', style, eyebrow)
}

const getTitleSize = (sizes: DocsSizes, text: string) => {
  if (text.length > sizes.titleLongestLength) {
    return sizes.titleTextLongest
  }

  if (text.length > sizes.titleLongLength) {
    return sizes.titleTextLong
  }

  return sizes.titleText
}

const getTitleClamp = (context: DocsContext): number | undefined => {
  const { card, sizes } = context

  if (card.description && card.title) {
    return sizes.titleMaxLinesWithDescription
  }

  if (card.eyebrow) {
    return sizes.titleMaxLines
  }
}

const renderTitle = (context: DocsContext, text: string): Node => {
  const { fonts, sizes } = context
  const clamp = getTitleClamp(context)
  const isLong = text.length > sizes.titleLongestLength
  const style = {
    fontFamily: fonts.title,
    fontSize: getTitleSize(sizes, text),
    fontWeight: isLong ? 400 : 700,
    lineHeight: 1.15,
    letterSpacing: isLong ? '-0.0125em' : '-0.025em',
    display: 'block',
  }

  // Satori throws on lineClamp: undefined, so the key is added only when set.
  return h('div', clamp ? { ...style, lineClamp: clamp } : style, text)
}

const renderDescription = (context: DocsContext, text: string): Node => {
  const style = {
    fontFamily: context.fonts.title,
    fontSize: context.sizes.descriptionText,
    lineHeight: 1.35,
    color: context.theme.textMuted,
    display: 'block',
    lineClamp: context.sizes.descriptionMaxLines,
  }

  return h('div', style, text)
}

const renderHeadline = (context: DocsContext): Node => {
  const { card } = context
  const children: Array<Node | undefined> = [
    card.eyebrow ? renderEyebrow(context, card.eyebrow) : undefined,
  ]

  if (card.title) {
    children.push(renderTitle(context, card.title))
  }

  if (card.description && card.title) {
    children.push(renderDescription(context, card.description))
  }

  if (card.description && !card.title) {
    children.push(renderTitle(context, card.description))
  }

  return h('div', { display: 'flex', flexDirection: 'column', gap: 16 }, children)
}

const renderFooter = (context: DocsContext, text: string): Node => {
  const { fonts, footerIcon, sizes, theme } = context

  return h('div', { display: 'flex', alignItems: 'center', gap: 14, color: theme.textMuted }, [
    footerIcon ? renderIcon(footerIcon, sizes.footerIcon) : undefined,
    h('div', { fontFamily: fonts.label, fontSize: sizes.footerText }, text),
  ])
}

const renderDots = (context: DocsContext): Node => {
  const { sizes, theme } = context
  const dots: Array<Node> = []

  for (let y = sizes.railDotStep / 2; y < sizes.cardHeight; y += sizes.railDotStep) {
    for (let x = sizes.railDotStep / 2; x < sizes.railWidth; x += sizes.railDotStep) {
      const opacity = x / sizes.railWidth

      dots.push({
        type: 'circle',
        props: { cx: x, cy: y, r: sizes.railDotRadius, fill: theme.pattern, opacity },
      })
    }
  }

  const svg: Node = {
    type: 'svg',
    props: {
      width: sizes.railWidth,
      height: sizes.cardHeight,
      viewBox: `0 0 ${sizes.railWidth} ${sizes.cardHeight}`,
      children: dots,
    },
  }

  return h('div', { position: 'absolute', top: 0, right: 0, display: 'flex' }, svg)
}

const renderBackground = (context: DocsContext): Node | undefined => {
  const { background, backgroundImage, sizes } = context

  if (backgroundImage && 'src' in backgroundImage) {
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: sizes.cardWidth,
      height: sizes.cardHeight,
      objectFit: 'cover',
    }

    return { type: 'img', props: { src: backgroundImage.src, style } }
  }

  if (background && 'pattern' in background) {
    return renderDots(context)
  }
}

export const docsLayout: Layout = {
  weights: { title: [400, 700], label: [500] },
  sizes: docsSizes,
  render: (layoutContext) => {
    const context: DocsContext = {
      ...layoutContext,
      sizes: { ...docsSizes, ...layoutContext.sizes },
    }
    const { card, sizes, theme } = context
    const cardStyle = {
      width: sizes.cardWidth,
      height: sizes.cardHeight,
      display: 'flex',
      background: theme.bg,
      color: theme.text,
    }
    const bodyStyle = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: sizes.cardPadding,
    }

    return h('div', cardStyle, [
      renderBackground(context),
      h('div', bodyStyle, [
        renderLogo(context),
        renderHeadline(context),
        card.footer ? renderFooter(context, card.footer) : undefined,
      ]),
    ])
  },
}
