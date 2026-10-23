import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'
import { h } from '../helpers.js'

const stat = (label: string, value: string) => {
  return h('div', { display: 'flex', flexDirection: 'column', gap: 6 }, [
    h('div', { display: 'flex', fontSize: 22, color: '#8b8b8b', letterSpacing: '0.08em' }, label),
    h('div', { display: 'flex', fontSize: 44, color: '#f5f5f5' }, value),
  ])
}

// A week of downloads drawn as a line, scaled into a 1072 by 90 box.
const downloads = [61, 64, 58, 70, 74, 69, 81, 86, 83, 92, 98, 95, 104, 111]
const points = downloads.map((value, index) => `${(index / 13) * 1072},${90 - (value - 50) * 1.4}`)
const sparkline = `<svg xmlns="http://www.w3.org/2000/svg" width="1072" height="90"><polyline points="${points.join(' ')}" fill="none" stroke="#c6f135" stroke-width="3" /></svg>`

const card: Card = {
  header: {
    text: './tinyqueue',
  },
  title: 'tinyqueue',
  description: 'The smallest job queue that still retries.',
  extra: h('div', { display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }, [
    h('div', { display: 'flex', gap: 72 }, [
      stat('WEEKLY', '1.2M'),
      stat('VERSION', '4.2.1'),
      stat('SIZE', '1.8 kB'),
      stat('LICENSE', 'MIT'),
    ]),
    {
      type: 'img',
      props: {
        src: `data:image/svg+xml;base64,${Buffer.from(sparkline).toString('base64')}`,
        width: 1072,
        height: 90,
      },
    },
  ]),
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#0b0b0b',
    accent: '#c6f135',
  },
  fonts: {
    title: 'jetbrains-mono',
    body: 'jetbrains-mono',
    label: 'jetbrains-mono',
  },
  sizes: {
    contentWidth: 1072,
    titleText: 88,
    titleTracking: '-0.05em',
  },
}

export const png = await renderPng(card, style)
