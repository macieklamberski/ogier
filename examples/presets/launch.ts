import type { Card, Style } from '../../src/index.js'
import { dark } from '../../src/themes/index.js'

export const card: Card = {
  header: { text: 'Loopwise', icon: { file: '@tabler/icons/outline/send-2.svg' }, aside: 'v3.0' },
  eyebrow: 'Changelog',
  title: 'Scheduled sends are finally here',
  description: 'Write it tonight and let it land in the morning.',
  footer: { text: 'loopwise.example' },
}

export const style: Style = {
  theme: {
    ...dark,
    bg: '#3000f5',
    text: '#ffffff',
    muted: '#cfc7ff',
    accent: '#ffffff',
    pattern: '#8f7dff',
  },
  fonts: { title: 'space-mono', body: 'space-grotesk', label: 'space-grotesk' },
  sizes: { titleText: 64, titleWeight: 700, titleTracking: '-0.06em' },
  background: { pattern: 'dots' },
}
