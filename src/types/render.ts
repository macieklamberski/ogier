import type { LayoutName } from '../layouts/index.js'
import type { Background, Fonts, IconRef, SizeOverrides, Theme } from './card.js'
import type { Layout } from './layout.js'

export type RenderOptions = {
  layout?: LayoutName | Layout
  theme?: Theme
  sizes?: SizeOverrides
  fonts?: Fonts
  logo?: IconRef
  footerIcon?: IconRef
  background?: Background | null
}
