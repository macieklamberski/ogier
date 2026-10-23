import type satori from 'satori'

export type ImageRef =
  | { file: string | URL }
  | { svg: string | Uint8Array }
  | { data: Uint8Array; type: 'image/png' | 'image/jpeg' }

export type IconRef = ImageRef & { color?: string }

export type Extra = Parameters<typeof satori>[0]

export type Slot = {
  text?: string
  icon?: IconRef
  aside?: string
}

export type Align = {
  horizontal?: 'left' | 'center' | 'right'
  vertical?: 'top' | 'center' | 'bottom'
}

export type Card = {
  header?: Slot
  icon?: IconRef
  eyebrow?: string
  title?: string
  byline?: string
  description?: string
  footer?: Slot
  image?: ImageRef & { position?: 'left' | 'right' }
  align?: Align
  extra?: Extra
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
  iconSize: number
  iconRadius: number
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
  labelWeight: number
  bodyWeight: number
  titleLineHeight: number
  titleTracking: string
  titleTrackingLong: string
  titleMaxLines: number
  titleMaxLinesWithDescription: number
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
  railStep: number
  /** @deprecated Use `railStep` instead. */
  railDotStep?: number
  railDotRadius: number
  railStrokeWidth: number
}

export type FontRole = 'title' | 'body' | 'label'

export type FontFile = {
  data: Uint8Array | ArrayBuffer
  weight: number
  style?: 'normal' | 'italic'
}

export type Fonts = Partial<Record<FontRole, string | Array<FontFile>>>

export type Background =
  | {
      pattern: 'dots' | 'stripes' | 'grid' | 'crosses' | 'waves' | 'checks'
      angle?: number
      fade?: boolean
    }
  | { image: ImageRef }
