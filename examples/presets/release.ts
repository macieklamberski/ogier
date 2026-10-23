import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'

const card: Card = {
  header: {
    text: 'Driftwood',
    icon: {
      file: '@tabler/icons/outline/sailboat.svg',
    },
    aside: 'Release',
  },
  title: '4.0',
  description: 'Streaming builds, a new router and half the install size.',
  footer: {
    text: 'driftwood.example/blog/4-0',
    aside: 'October 2026',
  },
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#0a0f1f',
    title: '#7cc7ff',
    muted: '#93a4c8',
    pattern: 'rgba(124, 199, 255, 0.28)',
  },
  fonts: {
    title: 'bricolage-grotesque',
    body: 'inter',
    label: 'inter',
  },
  sizes: {
    titleText: 260,
    titleWeight: 800,
    titleLineHeight: 0.9,
    titleTracking: '-0.06em',
    railWidth: 1200,
  },
  background: {
    pattern: 'grid',
  },
}

export const png = await renderPng(card, style)
