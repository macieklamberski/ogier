import type { Card, Style } from '../../src/index.js'
import { light } from '../../src/themes/index.js'

export const card: Card = {
  header: {
    text: 'Notes from a small server',
    aside: 'May 4, 2026',
  },
  title: 'I moved my blog off the cloud and onto a shelf',
  byline: 'Ana Ruiz',
  footer: {
    text: 'anaruiz.example',
  },
}

export const style: Style = {
  theme: {
    ...light,
    accent: '#e0452b',
  },
  fonts: {
    title: 'gloock',
    body: 'dm-sans',
    label: 'dm-sans',
  },
  sizes: {
    headlinePosition: 'bottom',
    barHeight: 12,
    headerText: 28,
    titleWeight: 400,
    titleTracking: '-0.005em',
  },
}
