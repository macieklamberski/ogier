import type { Card, Style } from '../../src/index.js'
import { light } from '../../src/themes/index.js'

export const card: Card = {
  title: 'Plan a garden bed by bed',
  description: 'Sketch the plot, pick the plants and get a planting calendar.',
  footer: {
    text: 'plotwise.example',
  },
  align: 'center',
}

export const style: Style = {
  theme: {
    ...light,
    bg: '#eef3e8',
    accent: '#3f7d3a',
  },
  fonts: {
    title: 'bricolage-grotesque',
    body: 'inter',
    label: 'jetbrains-mono',
  },
  sizes: {
    contentWidth: 960,
    titleTracking: '-0.035em',
  },
}
