import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'

const card: Card = {
  title: 'Plan a garden bed by bed',
  description: 'Sketch the plot, pick the plants and get a planting calendar.',
  footer: {
    text: 'plotwise.example',
  },
  align: 'center',
}

const style: Style = {
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

export const png = await renderPng(card, style)
