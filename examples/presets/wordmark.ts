import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'

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
