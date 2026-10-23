import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'
import { h, icon } from '../helpers.js'

const fact = (name: string, text: string) => {
  return h('div', { display: 'flex', alignItems: 'center', gap: 12 }, [
    icon(name, '#0f172a', 32),
    h('div', { display: 'flex', fontSize: 30, color: '#0f172a' }, text),
  ])
}

const card: Card = {
  header: {
    text: 'Northline Conf',
    aside: 'Talk',
  },
  eyebrow: 'Main stage',
  title: 'Shipping on Fridays, safely',
  byline: 'Tomasz Wierzbicki · Platform lead at Kelp',
  extra: h('div', { display: 'flex', gap: 48, marginTop: 20 }, [
    fact('calendar-event', 'May 14, 10:30'),
    fact('map-pin', 'Gdańsk'),
  ]),
}

const style: Style = {
  theme: {
    ...light,
    bg: '#e9f6ff',
    text: '#0f172a',
    eyebrow: '#e5484d',
    byline: '#334155',
    accent: '#e5484d',
    pattern: 'rgba(15, 23, 42, 0.14)',
  },
  fonts: {
    title: 'space-grotesk',
    body: 'space-grotesk',
    label: 'space-mono',
  },
  sizes: {
    titleText: 84,
    titleTracking: '-0.045em',
    barHeight: 20,
  },
  background: {
    pattern: 'checks',
  },
}

export const png = await renderPng(card, style)
