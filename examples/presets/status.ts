import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'
import { h } from '../helpers.js'

// Ninety days of uptime, one bar a day, with two rough days.
const days = Array.from({ length: 90 }, (_, index) => {
  if (index === 37) {
    return '#f5a524'
  }

  if (index === 81) {
    return '#f31260'
  }

  return '#17c964'
})

const card: Card = {
  header: {
    text: 'Pantry status',
    icon: {
      file: '@tabler/icons/outline/activity-heartbeat.svg',
    },
    aside: '99.98% uptime',
  },
  eyebrow: 'Resolved',
  title: 'Delayed webhook deliveries in Europe',
  description: 'Deliveries queued for up to 14 minutes. All events have been sent.',
  extra: h(
    'div',
    { display: 'flex', gap: 4, marginTop: 20 },
    days.map((color) => h('div', { width: 8, height: 44, borderRadius: 2, background: color })),
  ),
  footer: {
    text: 'status.pantry.example',
    aside: 'Oct 21, 09:12 UTC',
  },
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#101418',
    eyebrow: '#17c964',
  },
  fonts: {
    title: 'geist-sans',
    body: 'geist-sans',
    label: 'geist-mono',
  },
  sizes: {
    contentWidth: 1072,
    titleText: 60,
    titleTracking: '-0.035em',
  },
}

export const png = await renderPng(card, style)
