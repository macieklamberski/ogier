import type { LayoutName } from '../layouts/index.js'
import type { Background, Fonts, SizeOverrides, Theme } from './card.js'
import type { Layout } from './layout.js'

export type Style = {
  layout?: LayoutName | Layout
  theme?: Theme
  sizes?: SizeOverrides
  fonts?: Fonts
  background?: Background
}
