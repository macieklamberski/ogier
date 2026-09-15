import type { Card, Style } from '../../src/index.js'
import { light } from '../../src/themes/index.js'

export const card: Card = {
  header: {
    text: 'tidewater',
    icon: { file: '@tabler/icons/outline/ripple.svg' },
    aside: 'v2.4.0',
  },
  eyebrow: 'Reference › Options',
  title: 'Retry and timeout options',
  description: 'Every option a stream reads when a consumer falls behind.',
  footer: { text: 'tidewater.dev', icon: { file: '@tabler/icons/outline/book.svg' } },
}

export const style: Style = {
  theme: { ...light, accent: '#2f6fed' },
}
