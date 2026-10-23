import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'

const card: Card = {
  icon: {
    file: '@tabler/icons/outline/quote.svg',
    color: '#b4532a',
  },
  title: 'The best code is the code you never had to write.',
  byline: '— Ines Okafor, on deleting a service',
  footer: {
    text: 'fieldnotes.example',
  },
  align: {
    horizontal: 'center',
  },
}

const style: Style = {
  theme: {
    ...light,
    bg: '#f6efe3',
    text: '#2b2118',
    byline: '#b4532a',
    muted: '#8a7a66',
    pattern: 'rgba(43, 33, 24, 0.12)',
  },
  fonts: {
    title: 'instrument-serif',
    body: 'inter',
    label: 'inter',
  },
  sizes: {
    contentWidth: 1000,
    iconSize: 64,
    titleText: 84,
    titleTextLong: 84,
    titleWeight: 400,
    titleLineHeight: 1.05,
    titleTracking: '-0.02em',
    bylineText: 30,
  },
  background: {
    pattern: 'crosses',
    fade: false,
  },
}

export const png = await renderPng(card, style)
