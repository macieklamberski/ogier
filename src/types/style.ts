import type { Background, Fonts, SizeOverrides, Theme } from './card.js'
import type { Layout } from './layout.js'

export type Style = {
  layout?: Layout
  theme?: Theme
  sizes?: SizeOverrides
  fonts?: Fonts
  background?: Background
}
