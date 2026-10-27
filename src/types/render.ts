import type { Background, Card, Extra, FontElement, Sizes, Theme } from './card.js'

export type Node = {
  type: string
  props: Record<string, unknown>
}

export type Icon = { svg: string } | { src: string }

// An icon given as an element is drawn as it is, so it keeps its color to apply when drawn.
export type ElementIcon = { element: Extra; color?: string }

export type RenderContext = {
  card: Card
  theme: Theme
  sizes: Sizes
  fonts: Record<FontElement, string>
  headerIcon?: Icon | ElementIcon
  icon?: Icon | ElementIcon
  footerIcon?: Icon | ElementIcon
  image?: Icon
  background?: Background
  backgroundImage?: Icon
}
