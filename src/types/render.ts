import type { Background, Card, FontRole, Sizes, Theme } from './card.js'

export type Node = {
  type: string
  props: Record<string, unknown>
}

export type Icon = { svg: string } | { src: string }

export type RenderContext = {
  card: Card
  theme: Theme
  sizes: Sizes
  fonts: Record<FontRole, string>
  headerIcon?: Icon
  footerIcon?: Icon
  image?: Icon
  background?: Background
  backgroundImage?: Icon
}
