import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'

const card: Card = {
  header: {
    text: 'Ledgerly',
    icon: {
      file: '@tabler/icons/outline/bolt.svg',
    },
  },
  title: 'Close the books in an afternoon, not a week.',
  footer: {
    text: 'ledgerly.example',
    aside: 'Finance, rebuilt',
  },
  align: {
    horizontal: 'center',
  },
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#ff5a1f',
    text: '#1a0a00',
    muted: '#3d1500',
    pattern: 'rgba(26, 10, 0, 0.22)',
  },
  fonts: {
    title: 'bricolage-grotesque',
    body: 'dm-sans',
    label: 'dm-sans',
  },
  sizes: {
    contentWidth: 1000,
    titleText: 96,
    titleTextLong: 96,
    titleWeight: 800,
    titleLineHeight: 1,
    titleTracking: '-0.055em',
    railStrokeWidth: 3,
  },
  background: {
    pattern: 'stripes',
    angle: -30,
    fade: false,
  },
}

export const png = await renderPng(card, style)
