import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'
import { h } from '../helpers.js'

const posts = [
  ['2026', 'Notes on writing a feed parser twice', '18k'],
  ['2025', 'The case for boring deploys', '41k'],
  ['2025', 'What I learned rendering 10,000 images', '9k'],
  ['2024', 'A year without a framework', '27k'],
]

const row = ([year, title, views]: Array<string>) => {
  return h(
    'div',
    {
      display: 'flex',
      gap: 32,
      padding: '14px 0',
      borderTop: '2px solid #e4e4e7',
      fontSize: 30,
      color: '#18181b',
    },
    [
      h('div', { display: 'flex', width: 90, color: '#a1a1aa' }, year),
      h('div', { display: 'flex', flex: 1 }, title),
      h('div', { display: 'flex', color: '#a1a1aa' }, views),
    ],
  )
}

const card: Card = {
  header: {
    text: 'Ana Ruiz',
    aside: 'anaruiz.example',
  },
  extra: h('div', { display: 'flex', flexDirection: 'column', width: 1072 }, posts.map(row)),
  title: 'Writing',
  align: {
    vertical: 'top',
  },
}

const style: Style = {
  theme: {
    ...light,
    bg: '#ffffff',
    text: '#18181b',
  },
  fonts: {
    title: 'literata',
    body: 'inter',
    label: 'inter',
  },
  sizes: {
    contentWidth: 1072,
    titleText: 64,
    titleWeight: 600,
    titleTracking: '-0.03em',
  },
}

export const png = await renderPng(card, style)
