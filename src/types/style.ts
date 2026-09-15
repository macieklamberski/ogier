import type { Background, Fonts, Sizes, Theme } from './card.js'

export type Style = {
  theme?: Theme
  sizes?: Partial<Sizes>
  fonts?: Fonts
  background?: Background
}
