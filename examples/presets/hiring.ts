import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'
import { h } from '../helpers.js'

const pill = (text: string) => {
  return h(
    'div',
    {
      display: 'flex',
      padding: '10px 22px',
      borderRadius: 999,
      border: '2px solid #111111',
      fontSize: 26,
      color: '#111111',
    },
    text,
  )
}

const card: Card = {
  header: {
    text: 'Kelp',
    icon: {
      file: '@tabler/icons/outline/plant-2.svg',
    },
  },
  eyebrow: "We're hiring",
  title: 'Senior Product Engineer',
  extra: h('div', { display: 'flex', gap: 14, marginTop: 20 }, [
    pill('Remote, EU'),
    pill('Full-time'),
    pill('€90–120k'),
  ]),
  footer: {
    text: 'kelp.example/jobs',
  },
}

const style: Style = {
  theme: {
    ...light,
    bg: '#d9f99d',
    text: '#111111',
    muted: '#3f3f46',
    eyebrow: '#111111',
  },
  fonts: {
    title: 'bricolage-grotesque',
    body: 'dm-sans',
    label: 'dm-sans',
  },
  sizes: {
    titleText: 96,
    titleWeight: 800,
    titleTracking: '-0.05em',
    eyebrowWeight: 700,
  },
}

export const png = await renderPng(card, style)
