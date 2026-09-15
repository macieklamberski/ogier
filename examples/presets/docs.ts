import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'

const card: Card = {
  header: {
    text: 'tidewater',
    icon: {
      file: '@tabler/icons/outline/ripple.svg',
    },
  },
  eyebrow: 'Guides › Streams',
  title: 'Backpressure without a buffer',
  footer: {
    text: 'tidewater/tidewater',
    icon: {
      file: '@tabler/icons/outline/brand-github.svg',
    },
  },
}

const style: Style = {
  theme: {
    ...dark,
    accent: '#4dd4c6',
  },
  background: {
    pattern: 'dots',
  },
}

export const png = await renderPng(card, style)
