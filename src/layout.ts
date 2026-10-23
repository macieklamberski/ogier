import { isObject, trimObject } from 'trousse'
import { renderPattern } from './patterns.js'
import type {
  Align,
  ElementIcon,
  Extra,
  FontElement,
  Icon,
  Node,
  RenderContext,
  Sizes,
  Slot,
} from './types/index.js'
import { colorSvg, toDataUri } from './utils/images.js'

type LineRole = 'header' | 'footer'

const headlineGap = 16

const titleWeights = [400, 500, 700]

// Satori draws a weight that was not loaded in the nearest one it has, so a title weight set in
// the sizes is loaded next to the defaults. Satori also draws text with no fontWeight at 400, so
// every text node sets its weight, and font files passed for it are picked by that weight.
export const getFontWeights = (sizes: Sizes): Record<FontElement, Array<number>> => {
  const title = new Set([...titleWeights, sizes.titleWeight, sizes.titleWeightLong])

  return {
    title: [...title].sort((a, b) => a - b),
    description: [sizes.descriptionWeight],
    header: [sizes.headerWeight],
    aside: [sizes.asideWeight],
    eyebrow: [sizes.eyebrowWeight],
    byline: [sizes.bylineWeight],
    footer: [sizes.footerWeight],
  }
}

export const defaultSizes: Sizes = {
  cardWidth: 1200,
  cardHeight: 630,
  cardPadding: { top: 56, right: 64, bottom: 56, left: 64 },
  contentWidth: 800,
  headerIcon: 56,
  headerText: 44,
  headerWeight: 500,
  headerGap: 20,
  headerTracking: '0em',
  asideText: 26,
  asideWeight: 500,
  asideBaseline: 0.73,
  asideTracking: '0em',
  lineMaxWidth: 536,
  iconSize: 88,
  iconRadius: 0,
  slotLineHeight: 1.2,
  eyebrowText: 26,
  eyebrowWeight: 500,
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
  bylineText: 28,
  bylineWeight: 500,
  bylineTracking: '0em',
  descriptionText: 30,
  descriptionWeight: 400,
  descriptionLineHeight: 1.35,
  descriptionMaxLines: 2,
  descriptionTracking: '0em',
  footerIcon: 32,
  footerText: 28,
  footerWeight: 500,
  footerGap: 14,
  footerTracking: '0em',
  barHeight: 0,
  railWidth: 600,
  railStep: 24,
  railDotRadius: 2,
  railStrokeWidth: 1,
}

export const resolveSizes = (sizes: Partial<Sizes> = {}): Sizes => {
  const { railDotStep, ...rest } = sizes

  return {
    ...defaultSizes,
    railStep: railDotStep ?? defaultSizes.railStep,
    ...trimObject(rest),
  }
}

const flexAlign: Record<NonNullable<Align['horizontal']>, string> = {
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

// The satori in Next's ImageResponse stretches an SVG without a height across the whole line, so
// an element that sets no height of its own gets the icon's. A component that passes its props
// on to its SVG takes it too.
const withHeight = (element: Extra, height: number): unknown => {
  if (!isObject(element) || !('props' in element) || !isObject(element.props)) {
    return element
  }

  if ('height' in element.props && element.props.height !== undefined) {
    return element
  }

  return { ...element, props: { ...element.props, height } }
}

// Satori embeds an SVG as an image, so the slot color is written into the markup first. The
// width comes from the markup, so a wordmark keeps its shape. An element goes in a box of the
// icon's height whose color its currentColor takes, and an SVG element takes its width from its
// viewBox.
const renderIcon = (
  icon: Icon | ElementIcon,
  height: number,
  color: string,
  borderRadius?: number,
): Node => {
  if ('element' in icon) {
    // The satori Next's ImageResponse bundles throws on a style property set to undefined, so
    // the radius is only added when there is one.
    const style = {
      display: 'flex',
      height,
      flexShrink: 0,
      overflow: 'hidden',
      color: icon.color ?? color,
      ...(borderRadius === undefined ? {} : { borderRadius }),
    }

    return h('div', style, withHeight(icon.element, height))
  }

  const src = 'src' in icon ? icon.src : toDataUri(colorSvg(icon.svg, color), 'image/svg+xml')
  const style = borderRadius === undefined ? undefined : { borderRadius }

  return { type: 'img', props: { src, height, style } }
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
    fontFamily: fonts.aside,
    fontWeight: sizes.asideWeight,
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
    alignItems: role === 'header' ? 'flex-start' : 'flex-end',
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
    fontFamily: fonts[role],
    fontWeight: sizes[`${role}Weight`],
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
    fontFamily: context.fonts.eyebrow,
    fontWeight: context.sizes.eyebrowWeight,
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

// The height of a header or footer line: its text line or its icon, whichever is taller.
const getSlotHeight = (context: RenderContext, role: LineRole) => {
  const { card, sizes } = context
  const slot = card[role]

  if (!slot) {
    return 0
  }

  const text = slot.text ? sizes[`${role}Text`] * sizes.slotLineHeight : 0
  const icon = context[`${role}Icon`] ? sizes[`${role}Icon`] : 0

  return Math.max(text, icon)
}

// A title with no eyebrow or description takes the lines that fit between the header and the
// footer, so a long one ends in an ellipsis and does not push the footer off the card.
const getFreeLines = (context: RenderContext, fontSize: number) => {
  const { card, sizes } = context
  const { top = 0, bottom = 0 } = sizes.cardPadding
  const header = getSlotHeight(context, 'header')
  const footer = getSlotHeight(context, 'footer')
  const icon = context.icon ? sizes.iconSize + headlineGap : 0
  const byline = card.byline ? sizes.bylineText * sizes.slotLineHeight + headlineGap : 0
  const free = sizes.cardHeight - top - bottom - sizes.barHeight - header - footer - icon - byline

  return Math.max(1, Math.floor(free / (fontSize * sizes.titleLineHeight)))
}

const getTitleClamp = (context: RenderContext, fontSize: number): number => {
  const { card, sizes } = context

  if (card.description && card.title) {
    return sizes.titleMaxLinesWithDescription
  }

  if (card.eyebrow) {
    return sizes.titleMaxLines
  }

  return getFreeLines(context, fontSize)
}

const renderTitle = (context: RenderContext, text: string): Node => {
  const { fonts, sizes, theme } = context
  const fontSize = getTitleSize(sizes, text)
  const isLong = text.length > sizes.titleLongestLength
  const style = {
    color: theme.title ?? theme.text,
    fontFamily: fonts.title,
    fontSize,
    fontWeight: isLong ? sizes.titleWeightLong : sizes.titleWeight,
    lineHeight: sizes.titleLineHeight,
    letterSpacing: isLong ? sizes.titleTrackingLong : sizes.titleTracking,
    display: 'block',
    lineClamp: getTitleClamp(context, fontSize),
  }

  return h('div', style, text)
}

const renderByline = (context: RenderContext, byline: string): Node => {
  const style = {
    color: context.theme.byline ?? context.theme.text,
    fontFamily: context.fonts.byline,
    fontWeight: context.sizes.bylineWeight,
    fontSize: context.sizes.bylineText,
    letterSpacing: context.sizes.bylineTracking,
    display: 'block',
    lineClamp: 1,
  }

  return h('div', style, byline)
}

const renderDescription = (context: RenderContext, text: string): Node => {
  const style = {
    fontFamily: context.fonts.description,
    fontWeight: context.sizes.descriptionWeight,
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
  const { card, sizes, theme } = context
  const children: Array<Node | undefined> = [
    context.icon
      ? renderIcon(context.icon, sizes.iconSize, theme.text, sizes.iconRadius)
      : undefined,
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

  if (card.extra) {
    children.push(card.extra)
  }

  const horizontal = card.align?.horizontal ?? 'left'
  const rowStyle = {
    display: 'flex',
    justifyContent: flexAlign[horizontal],
    ...getImageMargin(context),
  }
  const columnStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: headlineGap,
    width: '100%',
    maxWidth: sizes.contentWidth,
    alignItems: flexAlign[horizontal],
    textAlign: horizontal,
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

// The body is positioned so it paints after the image, the background image and the rail, which
// are absolute and would otherwise cover the text. The footer sits at the bottom edge of the body,
// or under the headline when the headline is pushed to the bottom, so the space-between body keeps
// the headline in the middle otherwise.
const renderBody = (context: RenderContext): Node => {
  const { card, sizes } = context
  const { top = 0, right = 0, bottom = 0, left = 0 } = sizes.cardPadding
  const bodyStyle = {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  }
  const groupStyle = { display: 'flex', flexDirection: 'column', gap: headlineGap }
  const header = card.header ? renderLine(context, 'header', card.header) : undefined
  const footer = card.footer ? renderLine(context, 'footer', card.footer) : undefined
  const headline = renderHeadline(context)
  const vertical = card.align?.vertical ?? 'center'

  if (vertical === 'top') {
    return h('div', bodyStyle, [h('div', groupStyle, [header, headline]), footer ?? h('div', {})])
  }

  if (vertical === 'bottom') {
    return h('div', bodyStyle, [header ?? h('div', {}), h('div', groupStyle, [headline, footer])])
  }

  // An empty box stands in for a missing line, so the space-between body keeps the headline
  // where it sits when both lines are there.
  return h('div', bodyStyle, [header ?? h('div', {}), headline, footer ?? h('div', {})])
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
