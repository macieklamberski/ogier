import type { Card, Style } from 'ogier'
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'

const card: Card = {
  header: {
    text: 'Sunday Pages',
    aside: 'Book club',
  },
  title: 'Everyone reads slower on a Sunday',
  byline: 'Tomas Ferreira',
  description: 'Twelve chapters, one armchair and no reason to hurry.',
  image: {
    file: new URL('../assets/reader.jpg', import.meta.url),
  },
}

const style: Style = {
  theme: {
    ...light,
    bg: '#bf3a2e',
    text: '#fdf3dc',
    muted: '#f6dcc4',
    aside: '#fdf3dc',
  },
  fonts: {
    title: 'young-serif',
    body: 'ibm-plex-mono',
    label: 'ibm-plex-mono',
  },
  sizes: {
    titleText: 60,
    titleWeight: 400,
    titleLineHeight: 1.05,
    titleTracking: '-0.02em',
    titleMaxLinesWithDescription: 3,
    headerText: 32,
    headerTracking: '-0.03em',
    bylineTracking: '-0.03em',
    descriptionText: 24,
    descriptionTracking: '-0.03em',
    asideTracking: '-0.03em',
  },
}

export const png = await renderPng(card, style)
