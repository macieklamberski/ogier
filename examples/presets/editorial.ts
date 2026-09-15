import type { Card, Style } from '../../src/index.js'
import { renderPng } from '../../src/index.js'
import { light } from '../../src/themes/index.js'

// See: https://unsplash.com/photos/still-life-with-apples-pitcher-and-bowl-_sZ7R0C_xKY.
const card: Card = {
  header: {
    icon: {
      file: '@tabler/icons/outline/feather.svg',
    },
    aside: 'Essay',
  },
  title: 'What an Apple Knows About Time',
  byline: 'Mira Halvorsen',
  description: 'A still life is a clock that someone stopped on purpose.',
  image: {
    file: new URL('../assets/still.jpg', import.meta.url),
    position: 'left',
  },
  align: 'right',
}

const style: Style = {
  theme: {
    ...light,
    bg: '#f1eac6',
    text: '#15130d',
    header: '#ffffff',
    muted: '#3d3a2e',
    accent: '#8a2c1a',
  },
  fonts: {
    title: 'dm-serif-display',
    body: 'inter',
    label: 'inter',
  },
  sizes: {
    titleText: 76,
    titleWeight: 400,
    titleLineHeight: 1,
    titleTracking: '-0.02em',
    titleMaxLinesWithDescription: 3,
    bylineText: 32,
  },
}

export const png = await renderPng(card, style)
