import type { FontRole, Icon, Node, RenderContext, Sizes, Slot } from './types/index.js'
import { colorSvg, toDataUri } from './utils/icons.js'

type LineRole = 'header' | 'footer'

export const fontWeights: Record<FontRole, Array<number>> = {
  title: [400, 500, 700],
  label: [500],
}

export const defaultSizes: Sizes = {
  cardWidth: 1200,
  cardHeight: 630,
  cardPadding: '56px 400px 56px 64px',
  headerIcon: 56,
  headerText: 44,
  headerGap: 20,
  asideText: 26,
  lineMaxWidth: 536,
  eyebrowText: 26,
  titleText: 72,
  titleTextLong: 56,
  titleTextLongest: 44,
  titleLongLength: 40,
  titleLongestLength: 90,
  titleWeight: 700,
  titleWeightLong: 400,
  titleLineHeight: 1.15,
  titleLetterSpacing: '-0.025em',
  titleLetterSpacingLong: '-0.0125em',
  titleMaxLines: 3,
  titleMaxLinesWithDescription: 2,
  headlinePosition: 'middle',
  bylineText: 28,
  descriptionText: 30,
  descriptionLineHeight: 1.35,
  descriptionMaxLines: 2,
  footerIcon: 32,
  footerText: 28,
  footerGap: 14,
  barHeight: 0,
  railWidth: 600,
  railDotStep: 24,
  railDotRadius: 2,
}

const lineAlign: Record<LineRole, string> = {
  header: 'flex-start',
  footer: 'flex-end',
}

const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => {
  return { type, props: { style, children } }
}

// Satori embeds an SVG as an image, so the slot color is written into the markup first. The
// width comes from the markup, so a wordmark keeps its shape.
const renderIcon = (icon: Icon, height: number, color: string): Node => {
  const src = 'src' in icon ? icon.src : toDataUri(colorSvg(icon.svg, color), 'image/svg+xml')

  return { type: 'img', props: { src, height } }
}

const renderAside = (context: RenderContext, aside: string): Node => {
  const style = {
    marginLeft: 'auto',
    maxWidth: context.sizes.lineMaxWidth,
    fontFamily: context.fonts.label,
    fontSize: context.sizes.asideText,
    color: context.theme.textMuted,
    textAlign: 'right',
  }

  return h('div', style, aside)
}

// The header line grows downward from the top edge and the footer line upward from the bottom
// one, so the icon and the aside stay on the line nearest that edge when the text wraps.
const renderLine = (context: RenderContext, role: LineRole, slot: Slot): Node => {
  const { fonts, sizes, theme } = context
  const icon = context[`${role}Icon`]
  const color = role === 'header' ? theme.text : theme.textMuted
  const textStyle = {
    maxWidth: sizes.lineMaxWidth,
    fontFamily: fonts.label,
    fontSize: sizes[`${role}Text`],
  }

  return h(
    'div',
    { display: 'flex', alignItems: lineAlign[role], gap: sizes[`${role}Gap`], color },
    [
      icon ? renderIcon(icon, sizes[`${role}Icon`], color) : undefined,
      slot.text ? h('div', textStyle, slot.text) : undefined,
      slot.aside ? renderAside(context, slot.aside) : undefined,
    ],
  )
}

const renderEyebrow = (context: RenderContext, eyebrow: string): Node => {
  const style = {
    fontFamily: context.fonts.label,
    fontSize: context.sizes.eyebrowText,
    color: context.theme.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  }

  return h('div', style, eyebrow)
}

const getTitleSize = (sizes: Sizes, text: string) => {
  if (text.length > sizes.titleLongestLength) {
    return sizes.titleTextLongest
  }

  if (text.length > sizes.titleLongLength) {
    return sizes.titleTextLong
  }

  return sizes.titleText
}

const getTitleClamp = (context: RenderContext): number | undefined => {
  const { card, sizes } = context

  if (card.description && card.title) {
    return sizes.titleMaxLinesWithDescription
  }

  if (card.eyebrow) {
    return sizes.titleMaxLines
  }
}

const renderTitle = (context: RenderContext, text: string): Node => {
  const { fonts, sizes } = context
  const clamp = getTitleClamp(context)
  const isLong = text.length > sizes.titleLongestLength
  const style = {
    fontFamily: fonts.title,
    fontSize: getTitleSize(sizes, text),
    fontWeight: isLong ? sizes.titleWeightLong : sizes.titleWeight,
    lineHeight: sizes.titleLineHeight,
    letterSpacing: isLong ? sizes.titleLetterSpacingLong : sizes.titleLetterSpacing,
    display: 'block',
  }

  // Satori throws on lineClamp: undefined, so the key is added only when set.
  return h('div', clamp ? { ...style, lineClamp: clamp } : style, text)
}

const renderByline = (context: RenderContext, byline: string): Node => {
  const style = {
    fontFamily: context.fonts.label,
    fontSize: context.sizes.bylineText,
    display: 'block',
    lineClamp: 1,
  }

  return h('div', style, byline)
}

const renderDescription = (context: RenderContext, text: string): Node => {
  const style = {
    fontFamily: context.fonts.title,
    fontSize: context.sizes.descriptionText,
    lineHeight: context.sizes.descriptionLineHeight,
    color: context.theme.textMuted,
    display: 'block',
    lineClamp: context.sizes.descriptionMaxLines,
  }

  return h('div', style, text)
}

// A description alone takes the title's place, which is what a home page card wants.
const renderHeadline = (context: RenderContext, footer: Node | undefined): Node => {
  const { card } = context
  const children: Array<Node | undefined> = [
    card.eyebrow ? renderEyebrow(context, card.eyebrow) : undefined,
  ]

  if (card.title) {
    children.push(renderTitle(context, card.title))
  }

  if (card.byline) {
    children.push(renderByline(context, card.byline))
  }

  if (card.description && card.title) {
    children.push(renderDescription(context, card.description))
  }

  if (card.description && !card.title) {
    children.push(renderTitle(context, card.description))
  }

  children.push(footer)

  return h('div', { display: 'flex', flexDirection: 'column', gap: 16 }, children)
}

const renderDots = (context: RenderContext): Node => {
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

const renderBackground = (context: RenderContext): Node | undefined => {
  const { background, backgroundImage, sizes } = context

  if (backgroundImage) {
    const src =
      'src' in backgroundImage
        ? backgroundImage.src
        : toDataUri(backgroundImage.svg, 'image/svg+xml')
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: sizes.cardWidth,
      height: sizes.cardHeight,
      objectFit: 'cover',
    }

    return { type: 'img', props: { src, style } }
  }

  if (background && 'pattern' in background) {
    return renderDots(context)
  }
}

// The footer sits at the bottom edge of the body, or under the headline when the headline is
// pushed to the bottom, so the space-between body keeps the headline in the middle otherwise.
const renderBody = (context: RenderContext): Node => {
  const { card, sizes } = context
  const bodyStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: sizes.cardPadding,
  }
  const header = card.header ? renderLine(context, 'header', card.header) : undefined
  const footer = card.footer ? renderLine(context, 'footer', card.footer) : undefined

  if (sizes.headlinePosition === 'bottom') {
    return h('div', bodyStyle, [header, renderHeadline(context, footer)])
  }

  return h('div', bodyStyle, [header, renderHeadline(context, undefined), footer])
}

export const render = (context: RenderContext): Node => {
  const { sizes, theme } = context
  const cardStyle = {
    width: sizes.cardWidth,
    height: sizes.cardHeight,
    display: 'flex',
    flexDirection: 'column',
    background: theme.bg,
    color: theme.text,
  }
  const barStyle = { height: sizes.barHeight, background: theme.accent }

  return h('div', cardStyle, [
    renderBackground(context),
    renderBody(context),
    sizes.barHeight ? h('div', barStyle) : undefined,
  ])
}
