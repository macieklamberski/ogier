import type { Card, Style } from '../../src/index.js'
import { dark } from '../../src/themes/index.js'

export const card: Card = {
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

export const style: Style = {
  theme: {
    ...dark,
    accent: '#4dd4c6',
  },
  background: {
    pattern: 'dots',
  },
}
