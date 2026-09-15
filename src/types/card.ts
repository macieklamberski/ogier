export type ImageRef = { file: string | URL } | { svg: string | Uint8Array }

export type IconRef = ImageRef & { color?: string }

export type Slot = {
  text?: string
  icon?: IconRef
  aside?: string
}

export type Card = {
  header?: Slot
  eyebrow?: string
  title?: string
  byline?: string
  description?: string
  footer?: Slot
}

export type Theme = {
  bg: string
  text: string
  textMuted: string
  accent: string
  pattern: string
}

export type Sizes = {
  cardWidth: number
  cardHeight: number
  cardPadding: string
  headerIcon: number
  headerText: number
  headerGap: number
  asideText: number
  lineMaxWidth: number
  eyebrowText: number
  titleText: number
  titleTextLong: number
  titleTextLongest: number
  titleLongLength: number
  titleLongestLength: number
  titleWeight: number
  titleWeightLong: number
  titleLineHeight: number
  titleLetterSpacing: string
  titleLetterSpacingLong: string
  titleMaxLines: number
  titleMaxLinesWithDescription: number
  headlinePosition: 'middle' | 'bottom'
  bylineText: number
  descriptionText: number
  descriptionLineHeight: number
  descriptionMaxLines: number
  footerIcon: number
  footerText: number
  footerGap: number
  barHeight: number
  railWidth: number
  railDotStep: number
  railDotRadius: number
}

export type FontRole = 'title' | 'label'

export type Fonts = Partial<Record<FontRole, string>>

export type Background = { pattern: 'dots' } | { image: ImageRef }
