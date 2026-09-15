export type ImageRef = { file: string | URL } | { svg: string | Uint8Array }

export type IconRef = ImageRef & { color?: string }

export type Slot = {
  text: string
  icon?: IconRef
}

export type Card = {
  header?: Slot
  eyebrow?: string
  title?: string
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
}

export type SizeOverrides = Partial<Sizes> & Record<string, number | string | undefined>

export type FontRole = 'title' | 'label'

export type Fonts = Partial<Record<FontRole, string>>

export type Background = { pattern: 'dots' } | { image: ImageRef }
