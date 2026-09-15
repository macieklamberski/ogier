import type { Card, Style } from '../../src/index.js'
import { light } from '../../src/themes/index.js'

export const card: Card = {
  header: {
    icon: {
      file: '@tabler/icons/outline/flare.svg',
    },
  },
  title: 'nora lindqvist',
  description: 'software designer',
}

export const style: Style = {
  theme: {
    ...light,
    bg: '#f7f7f7',
    text: '#2f3133',
    muted: '#7c7c7c',
  },
  fonts: {
    title: 'commit-mono',
    body: 'commit-mono',
    label: 'commit-mono',
  },
  sizes: {
    cardPadding: {
      top: 64,
      right: 64,
      bottom: 64,
      left: 64,
    },
    headerIcon: 48,
    headlinePosition: 'bottom',
    titleText: 76,
    titleWeight: 500,
    titleTracking: '-0.04em',
    descriptionText: 76,
    descriptionTracking: '-0.04em',
    descriptionLineHeight: 1.15,
  },
}
