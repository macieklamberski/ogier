import type { Card, Style } from '../../src/index.js'
import { dark } from '../../src/themes/index.js'

// See: https://unsplash.com/photos/a-painting-of-blue-and-purple-flowers-on-a-white-background-F50wqBrZPgI.
export const card: Card = {
  header: { aside: 'Research' },
  title: 'Measuring turbulence in thin films of paint',
  byline: 'Fluid Dynamics Team',
  footer: { text: 'Halden Lab', aside: 'March 12, 2026' },
  image: { file: new URL('../assets/paint.jpg', import.meta.url) },
}

export const style: Style = {
  theme: {
    ...dark,
    bg: '#000000',
    text: '#ffffff',
    muted: '#8c8c8c',
    aside: '#111111',
    accent: '#6ea8ff',
  },
  fonts: { title: 'geist-sans', body: 'geist-sans', label: 'geist-mono' },
  sizes: {
    titleWeight: 500,
    titleTracking: '-0.03em',
    headerTracking: '-0.03em',
    bylineTracking: '-0.03em',
    footerTracking: '-0.03em',
    asideTracking: '-0.03em',
  },
}
