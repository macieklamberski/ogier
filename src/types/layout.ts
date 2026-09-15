import type { Background, Card, FontRole, SizeOverrides, Sizes, Theme } from './card.js'

export type Node = {
  type: string
  props: Record<string, unknown>
}

export type Icon = { svg: string } | { src: string }

export type LayoutContext = {
  card: Card
  theme: Theme
  sizes: Sizes & SizeOverrides
  fonts: Record<FontRole, string>
  headerIcon?: Icon
  footerIcon?: Icon
  background?: Background
  backgroundImage?: Icon
}

export type Layout = {
  weights: Record<FontRole, Array<number>>
  sizes: Sizes
  render: (context: LayoutContext) => Node
}
