import { describe, expect, it } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { t } from 'trousse'
import { renderElement as renderFullElement } from './index.js'
import { createRenderer, renderElement } from './lite.js'
import locales from './locales.json' with { type: 'json' }
import type { Card, FontFile, Style } from './types/index.js'

const readWeights = (family: string, weights: Array<number>): Promise<Array<FontFile>> => {
  return Promise.all(
    weights.map(async (weight) => {
      const file = await readFile(
        `node_modules/@fontsource/${family}/files/${family}-latin-${weight}-normal.woff`,
      )

      return { data: new Uint8Array(file), weight }
    }),
  )
}

const card: Card = {
  header: { text: 'feedsmith', icon: { svg: '<svg><path fill="currentColor" /></svg>' } },
  title: 'Parsing namespaces',
}

describe('renderElement', () => {
  it('should render the same element as the main entry from font files and svg icons', async () => {
    const style: Style = {
      fonts: {
        title: await readWeights('inter', [400, 500, 700]),
        body: await readWeights('inter', [400]),
        label: await readWeights('jetbrains-mono', [500]),
      },
    }
    const expected = await renderFullElement(card, style)

    expect(await renderElement(card, style)).toEqual(expected)
  })

  it('should throw when a role has no font files', async () => {
    const throwing = () => renderElement(card)

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.liteFontNeedsFiles, { family: 'inter' }),
    )
  })

  it('should throw when an image is given as a file', async () => {
    const value: Card = { ...card, header: { icon: { file: '@tabler/icons/outline/rss.svg' } } }
    const style: Style = {
      fonts: {
        title: await readWeights('inter', [400]),
        body: await readWeights('inter', [400]),
        label: await readWeights('inter', [400]),
      },
    }
    const throwing = () => renderElement(value, style)

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.liteImageNeedsData, { file: '@tabler/icons/outline/rss.svg' }),
    )
  })
})

describe('createRenderer', () => {
  it('should return the card size from the style before any render', () => {
    const renderer = createRenderer({ sizes: { cardWidth: 600, cardHeight: 315 } })
    const expected = { width: 600, height: 315 }

    expect(renderer.size).toEqual(expected)
  })
})
