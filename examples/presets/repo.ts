import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'
import { h, icon } from '../helpers.js'

const stat = (name: string, value: string) => {
  return h('div', { display: 'flex', alignItems: 'center', gap: 10 }, [
    icon(name, '#57606a', 30),
    h('div', { display: 'flex', fontSize: 30, color: '#24292f' }, value),
  ])
}

const card: Card = {
  header: {
    text: 'harbor-labs',
    icon: {
      file: '@tabler/icons/outline/brand-github.svg',
    },
  },
  title: 'harbor-labs/quay',
  description: 'A tiny HTTP client built on fetch, with retries, hooks and timeouts.',
  extra: h('div', { display: 'flex', gap: 48, marginTop: 24 }, [
    stat('star', '14.2k'),
    stat('git-fork', '412'),
    stat('circle-dot', '23 issues'),
    stat('users', '86 contributors'),
  ]),
}

const style: Style = {
  theme: {
    ...light,
    bg: '#ffffff',
    text: '#24292f',
    muted: '#57606a',
    accent: '#3178c6',
  },
  fonts: {
    title: 'geist-sans',
    body: 'geist-sans',
    label: 'geist-mono',
  },
  sizes: {
    contentWidth: 1072,
    titleText: 80,
    titleTracking: '-0.04em',
    descriptionMaxLines: 2,
    barHeight: 16,
  },
}

export const png = await renderPng(card, style)
