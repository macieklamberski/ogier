import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { dark } from 'ogier/themes'
import { h } from '../helpers.js'

const host = (initials: string, background: string) => {
  return h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 88,
      height: 88,
      marginRight: -18,
      borderRadius: 44,
      border: '5px solid #1b0f2e',
      background,
      color: '#1b0f2e',
      fontSize: 32,
      fontWeight: 700,
    },
    initials,
  )
}

const card: Card = {
  header: {
    text: 'Late Merge',
    icon: {
      file: '@tabler/icons/outline/microphone-2.svg',
    },
    aside: 'Ep. 142',
  },
  eyebrow: 'With Priya, Jonas and Lea',
  title: 'Why our monorepo has 400 packages and no regrets',
  extra: h('div', { display: 'flex', marginTop: 16 }, [
    host('PR', '#ffb86b'),
    host('JS', '#7ee0b5'),
    host('LM', '#f38ba8'),
  ]),
  footer: {
    text: 'latemerge.example',
    aside: '58 min',
  },
}

const style: Style = {
  theme: {
    ...dark,
    bg: '#1b0f2e',
    text: '#fdf4ff',
    muted: '#c4a7e7',
    accent: '#ffb86b',
  },
  fonts: {
    title: 'fraunces',
    body: 'inter',
    label: 'space-mono',
    eyebrow: 'inter',
  },
  sizes: {
    titleText: 68,
    titleWeight: 800,
    titleTracking: '-0.03em',
    eyebrowWeight: 600,
  },
}

export const png = await renderPng(card, style)
