import type { Card, Style } from '../../src/index.js'
import { renderPng } from '../../src/index.js'
import { dark } from '../../src/themes/index.js'

const card: Card = {
  header: {
    icon: {
      file: '@tabler/icons/outline/terminal-2.svg',
      color: '#a2e57b',
    },
  },
  description: 'Tail, filter and replay structured logs from one terminal.',
  footer: {
    text: 'logreel.example',
  },
}

const style: Style = {
  theme: {
    ...dark,
    accent: '#a2e57b',
  },
  fonts: {
    title: 'jetbrains-mono',
  },
  sizes: {
    titleTracking: '-0.04em',
  },
}

export const png = await renderPng(card, style)
