import type { Card, Style } from '../../src/index.js'
import { dark } from '../../src/themes/index.js'

export const card: Card = {
  header: { icon: { file: '@tabler/icons/outline/terminal-2.svg', color: '#a2e57b' } },
  description: 'Tail, filter and replay structured logs from one terminal.',
  footer: { text: 'logreel.example' },
}

export const style: Style = {
  theme: { ...dark, accent: '#a2e57b' },
  fonts: { title: 'jetbrains-mono' },
  sizes: { titleTracking: '-0.04em' },
}
