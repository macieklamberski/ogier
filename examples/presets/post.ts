import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'

const card: Card = {
  header: {
    text: 'Notes from a small server',
    aside: 'May 4, 2026',
  },
  title: 'I moved my blog off the cloud and onto a shelf',
  byline: 'Ana Ruiz',
  footer: {
    text: 'anaruiz.example',
  },
  align: {
    vertical: 'bottom',
  },
}

const style: Style = {
  theme: {
    ...light,
    accent: '#e0452b',
  },
  fonts: {
    title: 'literata',
    body: 'dm-sans',
    label: 'dm-sans',
  },
  sizes: {
    barHeight: 12,
    headerText: 28,
    titleWeight: 700,
    titleTracking: '-0.02em',
  },
}

export const png = await renderPng(card, style)
