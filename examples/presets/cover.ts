import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'

// See: https://unsplash.com/photos/a-black-and-white-photo-of-an-aerial-view-of-a-river-faHQlMrKx8U.
const card: Card = {
  header: {
    text: 'Halden Lab',
    aside: 'Research',
  },
  title: 'Measuring turbulence in thin films of paint',
  byline: 'Fluid Dynamics Team',
  footer: {
    text: 'halden.example',
    aside: 'March 12, 2026',
  },
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#000000',
    text: '#ffd84a',
    muted: '#ffd84a',
    aside: '#ffd84a',
    accent: '#6ea8ff',
  },
  fonts: {
    title: 'epunda-slab',
    body: 'epunda-slab',
    label: 'geist-mono',
  },
  sizes: {
    titleWeight: 700,
    titleTracking: '-0.02em',
    headerTracking: '-0.03em',
    bylineTracking: '-0.03em',
    footerTracking: '-0.03em',
    asideTracking: '-0.03em',
  },
  background: {
    image: {
      file: new URL('../assets/river.jpg', import.meta.url),
    },
  },
}

export const png = await renderPng(card, style)
