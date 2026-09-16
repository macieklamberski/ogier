import { renderPattern } from './patterns.js'
import type { Align, FontRole, Icon, Node, RenderContext, Sizes, Slot } from './types/index.js'
import { colorSvg, toDataUri } from './utils/icons.js'

type LineRole = 'header' | 'footer'

export const fontWeights: Record<FontRole, Array<number>> = {
  title: [400, 500, 700],
  body: [400],
  label: [500],
}

export const defaultSizes: Sizes = {
  cardWidth: 1200,
  cardHeight: 630,
  cardPadding: { top: 56, right: 64, bottom: 56, left: 64 },
  contentWidth: 800,
  headerIcon: 56,
  headerText: 44,
  headerGap: 20,
  headerTracking: '0em',
  asideText: 26,
  asideBaseline: 0.73,
  asideTracking: '0em',
  lineMaxWidth: 536,
  slotLineHeight: 1.2,
  eyebrowText: 26,
  eyebrowTracking: '0.12em',
  titleText: 72,
  titleTextLong: 56,
  titleTextLongest: 44,
  titleLongLength: 40,
  titleLongestLength: 90,
  titleWeight: 700,
  titleWeightLong: 400,
  titleLineHeight: 1.15,
  titleTracking: '-0.025em',
  titleTrackingLong: '-0.0125em',
  titleMaxLines: 3,
  titleMaxLinesWithDescription: 2,
  headlinePosition: 'middle',
  bylineText: 28,
  bylineTracking: '0em',
  descriptionText: 30,
  descriptionLineHeight: 1.35,
  descriptionMaxLines: 2,
  descriptionTracking: '0em',
  footerIcon: 32,
  footerText: 28,
  footerGap: 14,
  footerTracking: '0em',
  barHeight: 0,
  railWidth: 600,
  railStep: 24,
  railDotRadius: 2,
  railStrokeWidth: 1,
}

const lineAlign: Record<LineRole, string> = {
  header: 'flex-start',
  footer: 'flex-end',
}

const flexAlign: Record<Align, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => {
  return { type, props: { style, children } }
}

const getImageSrc = (image: Icon) => {
  return 'src' in image ? image.src : toDataUri(image.svg, 'image/svg+xml')
}

// Satori embeds an SVG as an image, so the slot color is written into the markup first. The
// width comes from the markup, so a wordmark keeps its shape.
const renderIcon = (icon: Icon, height: number, color: string): Node => {
  const src = 'src' in icon ? icon.src : toDataUri(colorSvg(icon.svg, color), 'image/svg+xml')

  return { type: 'img', props: { src, height } }
}

// The image covers half the card, so the text beside it keeps to the other half.
const getImageMargin = (context: RenderContext) => {
  const { card, sizes } = context

  if (!card.image) {
    return {}
  }

  const side = card.image.position === 'left' ? 'marginLeft' : 'marginRight'

  return { [side]: sizes.cardWidth / 2 }
}

const getTextWidth = (context: RenderContext) => {
  const { card, sizes } = context
  const { left = 0, right = 0 } = sizes.cardPadding
  const imageWidth = card.image ? sizes.cardWidth / 2 : 0

  return sizes.cardWidth - left - right - imageWidth
}

// Satori puts a baseline half the line height plus half the ascender and descender below the top
// of the line, so with one line height ratio for both texts the font's ascender and descender
// are what is left, and `asideBaseline` stands for their sum over the em size.
const getAsideShift = (sizes: Sizes, role: LineRole) => {
  const sizeGap = sizes[`${role}Text`] - sizes.asideText

  if (role === 'header') {
    return { marginTop: (sizeGap * (sizes.slotLineHeight + sizes.asideBaseline)) / 2 }
  }

  return { marginBottom: (sizeGap * (sizes.slotLineHeight - sizes.asideBaseline)) / 2 }
}

const renderAside = (context: RenderContext, role: LineRole, aside: string): Node => {
  const { fonts, sizes, theme } = context
  const style = {
    marginLeft: 'auto',
    ...getAsideShift(sizes, role),
    maxWidth: sizes.lineMaxWidth,
    fontFamily: fonts.label,
    fontSize: sizes.asideText,
    lineHeight: sizes.slotLineHeight,
    letterSpacing: sizes.asideTracking,
    color: theme.aside ?? theme.muted,
    textAlign: 'right',
  }

  return h('div', style, aside)
}

// The header line grows downward from the top edge and the footer line upward from the bottom
// one, so the icon and the aside stay on the line nearest that edge when the text wraps. The
// icon and the text shrink so a long text wraps before it pushes the aside past the card edge.
const renderLine = (context: RenderContext, role: LineRole, slot: Slot): Node => {
  const { fonts, sizes, theme } = context
  const icon = context[`${role}Icon`]
  const color = theme[role] ?? (role === 'header' ? theme.text : theme.muted)
  const lineStyle = {
    display: 'flex',
    alignItems: lineAlign[role],
    gap: sizes[`${role}Gap`],
  }
  const groupStyle = {
    ...lineStyle,
    maxWidth: getTextWidth(context),
    flexShrink: 1,
    color,
  }
  const textStyle = {
    maxWidth: sizes.lineMaxWidth,
    flexShrink: 1,
    fontFamily: fonts.label,
    fontSize: sizes[`${role}Text`],
    lineHeight: sizes.slotLineHeight,
    letterSpacing: sizes[`${role}Tracking`],
  }
  const group = h('div', groupStyle, [
    icon ? renderIcon(icon, sizes[`${role}Icon`], color) : undefined,
    slot.text ? h('div', textStyle, slot.text) : undefined,
  ])

  return h('div', lineStyle, [
    group,
    slot.aside ? renderAside(context, role, slot.aside) : undefined,
  ])
}

const renderEyebrow = (context: RenderContext, eyebrow: string): Node => {
  const style = {
    fontFamily: context.fonts.label,
    fontSize: context.sizes.eyebrowText,
    color: context.theme.eyebrow ?? context.theme.accent,
    textTransform: 'uppercase',
    letterSpacing: context.sizes.eyebrowTracking,
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
  const { fonts, sizes, theme } = context
  const clamp = getTitleClamp(context)
  const isLong = text.length > sizes.titleLongestLength
  const style = {
    color: theme.title ?? theme.text,
    fontFamily: fonts.title,
    fontSize: getTitleSize(sizes, text),
    fontWeight: isLong ? sizes.titleWeightLong : sizes.titleWeight,
    lineHeight: sizes.titleLineHeight,
    letterSpacing: isLong ? sizes.titleTrackingLong : sizes.titleTracking,
    display: 'block',
  }

  // Satori throws on lineClamp: undefined, so the key is added only when set.
  return h('div', clamp ? { ...style, lineClamp: clamp } : style, text)
}

const renderByline = (context: RenderContext, byline: string): Node => {
  const style = {
    color: context.theme.byline ?? context.theme.text,
    fontFamily: context.fonts.label,
    fontSize: context.sizes.bylineText,
    letterSpacing: context.sizes.bylineTracking,
    display: 'block',
    lineClamp: 1,
  }

  return h('div', style, byline)
}

const renderDescription = (context: RenderContext, text: string): Node => {
  const style = {
    fontFamily: context.fonts.body,
    fontSize: context.sizes.descriptionText,
    lineHeight: context.sizes.descriptionLineHeight,
    letterSpacing: context.sizes.descriptionTracking,
    color: context.theme.description ?? context.theme.muted,
    display: 'block',
    lineClamp: context.sizes.descriptionMaxLines,
  }

  return h('div', style, text)
}

// A description alone takes the title's place, which is what a home page card wants. Satori
// aligns only the wrapped lines of a text, so a one-line text is moved by the column instead.
const renderHeadline = (context: RenderContext): Node => {
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

  const rowStyle = {
    display: 'flex',
    justifyContent: flexAlign[card.align ?? 'left'],
    ...getImageMargin(context),
  }
  const columnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: context.sizes.contentWidth,
    alignItems: flexAlign[card.align ?? 'left'],
    textAlign: card.align ?? 'left',
  }

  return h('div', rowStyle, h('div', columnStyle, children))
}

const renderRail = (context: RenderContext): Node | undefined => {
  const { background, sizes, theme } = context

  if (!background || !('pattern' in background)) {
    return
  }

  const src = toDataUri(renderPattern(background, sizes, theme), 'image/svg+xml')
  const style = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: sizes.railWidth,
    height: sizes.cardHeight,
  }

  return { type: 'img', props: { src, style } }
}

const renderBackground = (context: RenderContext): Node | undefined => {
  const { backgroundImage, sizes } = context

  if (backgroundImage) {
    const src = getImageSrc(backgroundImage)
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

  return renderRail(context)
}

const renderImage = (context: RenderContext): Node | undefined => {
  const { card, image, sizes } = context

  if (!image) {
    return
  }

  const style = {
    position: 'absolute',
    top: 0,
    [card.image?.position ?? 'right']: 0,
    width: sizes.cardWidth / 2,
    height: sizes.cardHeight,
    objectFit: 'cover',
  }

  return { type: 'img', props: { src: getImageSrc(image), style } }
}

// The footer sits at the bottom edge of the body, or under the headline when the headline is
// pushed to the bottom, so the space-between body keeps the headline in the middle otherwise.
const renderBody = (context: RenderContext): Node => {
  const { card, sizes } = context
  const { top = 0, right = 0, bottom = 0, left = 0 } = sizes.cardPadding
  const bodyStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  }
  // An empty box stands in for a missing line, so the space-between body keeps the headline
  // where it sits when both lines are there.
  const header = card.header ? renderLine(context, 'header', card.header) : h('div', {})
  const footer = card.footer ? renderLine(context, 'footer', card.footer) : undefined

  if (sizes.headlinePosition === 'bottom') {
    const bottomStyle = { display: 'flex', flexDirection: 'column', gap: 16 }

    return h('div', bodyStyle, [header, h('div', bottomStyle, [renderHeadline(context), footer])])
  }

  return h('div', bodyStyle, [header, renderHeadline(context), footer ?? h('div', {})])
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
    renderImage(context),
    renderBody(context),
    sizes.barHeight ? h('div', barStyle) : undefined,
  ])
}
