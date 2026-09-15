export type ImageRef = { file: string | URL } | { svg: string | Uint8Array }

export type IconRef = ImageRef & { color?: string }

export type Slot = {
  text?: string
  icon?: IconRef
  aside?: string
}

export type Align = 'left' | 'center' | 'right'

export type Card = {
  header?: Slot
  eyebrow?: string
  title?: string
  byline?: string
  description?: string
  footer?: Slot
  image?: ImageRef & { position?: 'left' | 'right' }
  align?: Align
}

export type Theme = {
  bg: string
  text: string
  muted: string
  header?: string
  eyebrow?: string
  title?: string
  byline?: string
  description?: string
  footer?: string
  aside?: string
  accent: string
  pattern: string
}

export type Sizes = {
  cardWidth: number
  cardHeight: number
  cardPadding: { top?: number; right?: number; bottom?: number; left?: number }
  contentWidth: number
  headerIcon: number
  headerText: number
  headerGap: number
  headerTracking: string
  asideText: number
  asideBaseline: number
  asideTracking: string
  lineMaxWidth: number
  slotLineHeight: number
  eyebrowText: number
  eyebrowTracking: string
  titleText: number
  titleTextLong: number
  titleTextLongest: number
  titleLongLength: number
  titleLongestLength: number
  titleWeight: number
  titleWeightLong: number
  titleLineHeight: number
  titleTracking: string
  titleTrackingLong: string
  titleMaxLines: number
  titleMaxLinesWithDescription: number
  headlinePosition: 'middle' | 'bottom'
  bylineText: number
  bylineTracking: string
  descriptionText: number
  descriptionLineHeight: number
  descriptionMaxLines: number
  descriptionTracking: string
  footerIcon: number
  footerText: number
  footerGap: number
  footerTracking: string
  barHeight: number
  railWidth: number
  railDotStep: number
  railDotRadius: number
}

export type FontRole = 'title' | 'body' | 'label'

export type Fonts = Partial<Record<FontRole, string>>

export type Background = { pattern: 'dots' } | { image: ImageRef }
