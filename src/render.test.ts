import { describe, expect, it } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { t } from 'trousse'
import locales from './locales.json' with { type: 'json' }
import { createRenderer, renderElement, renderPng, renderSvg } from './render.js'
import type { Card, Fonts } from './types/index.js'

const card: Card = {
  header: { text: 'feedsmith' },
  eyebrow: 'Guides',
  title: 'Parsing namespaces',
  footer: { text: 'example/repo', icon: { file: '@tabler/icons/outline/brand-github.svg' } },
}

describe('renderElement', () => {
  it('should return the element tree with its size and fonts', async () => {
    const result = await renderElement(card, { sizes: { cardWidth: 600, cardHeight: 315 } })
    const value = {
      type: result.element.type,
      key: result.element.key,
      width: result.width,
      height: result.height,
      fontNames: [...new Set(result.fonts.map((font) => font.name))],
    }
    const expected = {
      type: 'div',
      key: null,
      width: 600,
      height: 315,
      fontNames: [
        'title-latin',
        'title-latin-ext',
        'body-latin',
        'body-latin-ext',
        'label-latin',
        'label-latin-ext',
      ],
    }

    expect(value).toEqual(expected)
  })

  it('should throw when the card has neither a title nor a description', async () => {
    const value = { header: { text: 'feedsmith' } }
    const throwing = () => renderElement(value)

    await expect(throwing()).rejects.toThrow(locales.errors.cardNeedsText)
  })
})

describe('renderSvg', () => {
  it('should render a card at the default size', async () => {
    const expected = '<svg width="1200" height="630"'

    expect(await renderSvg(card)).toStartWith(expected)
  })

  it('should render at an overridden size with a header icon from markup', async () => {
    const value: Card = {
      ...card,
      header: {
        text: 'feedsmith',
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" /></svg>',
        },
      },
    }
    const style = { sizes: { cardWidth: 600, cardHeight: 315 } }
    const expected = '<svg width="600" height="315"'

    expect(await renderSvg(value, style)).toStartWith(expected)
  })

  it('should render an icon-only header with an aside', async () => {
    const value: Card = {
      header: {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 4"><rect width="8" height="4" /></svg>',
        },
        aside: 'December 15, 2025',
      },
      title: 'Parsing namespaces',
    }
    const expected = '<svg width="1200" height="630"'

    expect(await renderSvg(value)).toStartWith(expected)
  })

  it('should render a card image cropped to cover the left half', async () => {
    const value: Card = {
      title: 'Parsing namespaces',
      image: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" /></svg>',
        position: 'left',
      },
    }
    const expected = '<image x="-15" y="0" width="630" height="630"'

    expect(await renderSvg(value)).toContain(expected)
  })

  it('should render the title in font files passed as bytes', async () => {
    const readWeight = async (weight: number) => {
      const file = await readFile(
        `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`,
      )

      return { data: new Uint8Array(file), weight }
    }
    const style = { fonts: { title: await Promise.all([400, 500, 700].map(readWeight)) } }
    const expected = await renderSvg(card)

    expect(await renderSvg(card, style)).toBe(expected)
  })

  it('should draw labels in weight 500 when label font files carry several weights', async () => {
    const readWeight = async (weight: number) => {
      const file = await readFile(
        `node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff`,
      )

      return { data: new Uint8Array(file), weight }
    }
    const style = { fonts: { label: await Promise.all([400, 500, 700].map(readWeight)) } }
    const expected = await renderSvg(card)

    expect(await renderSvg(card, style)).toBe(expected)
  })

  it('should render the card icon in the headline', async () => {
    const value: Card = {
      ...card,
      icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" /></svg>',
      },
    }
    const expected = '<image x="64" y="'

    expect(await renderSvg(value)).toContain(expected)
  })

  it('should render the extra element in the headline', async () => {
    const value: Card = {
      ...card,
      extra: { type: 'div', props: { style: { width: 40, height: 40, background: '#123456' } } },
    }
    const expected = 'fill="#123456"'

    expect(await renderSvg(value)).toContain(expected)
  })

  it('should render a card image from png bytes', async () => {
    const value: Card = {
      title: 'Parsing namespaces',
      image: {
        data: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNkYGD4DwABCQEBKdHA9AAAAABJRU5ErkJggg==',
          'base64',
        ),
        type: 'image/png',
      },
    }
    const expected = '<image x="585" y="0" width="630" height="630" href="data:image/png;base64,'

    expect(await renderSvg(value)).toContain(expected)
  })

  it('should throw when the card has neither a title nor a description', async () => {
    const value = { header: { text: 'feedsmith' } }
    const throwing = () => renderSvg(value)

    await expect(throwing()).rejects.toThrow(locales.errors.cardNeedsText)
  })
})

describe('createRenderer', () => {
  it('should render several cards through one renderer', async () => {
    const renderer = createRenderer({ sizes: { cardWidth: 600, cardHeight: 315 } })
    const values: Array<Card> = [card, { ...card, title: 'Generating feeds' }]
    const expected = '<svg width="600" height="315"'

    for (const value of values) {
      expect(await renderer.renderSvg(value)).toStartWith(expected)
    }
  })

  it('should load the fonts again after a failed load', async () => {
    const fonts: Fonts = { title: [] }
    const renderer = createRenderer({ fonts })
    const expected = '<svg width="1200" height="630"'

    await expect(renderer.renderSvg(card)).rejects.toThrow(
      t(locales.errors.fontFilesEmpty, { role: 'title' }),
    )

    fonts.title = 'inter'

    expect(await renderer.renderSvg(card)).toStartWith(expected)
  })

  it('should return the element tree from renderElement', async () => {
    const renderer = createRenderer()
    const result = await renderer.renderElement(card)
    const expected = { width: 1200, height: 630 }

    expect({ width: result.width, height: result.height }).toEqual(expected)
  })

  it('should return a PNG from renderPng', async () => {
    const renderer = createRenderer()
    const result = await renderer.renderPng(card)
    const expected = '89504e470d0a1a0a'

    expect(result.subarray(0, 8).toString('hex')).toBe(expected)
  })
})

describe('renderPng', () => {
  it('should return a PNG with the card dimensions in its header', async () => {
    const result = await renderPng(card)
    const header = [
      result.subarray(0, 8).toString('hex'),
      result.readUInt32BE(16),
      result.readUInt32BE(20),
    ]
    const expected = ['89504e470d0a1a0a', 1200, 630]

    expect(header).toEqual(expected)
  })

  it('should throw when the card image is WebP', async () => {
    const value: Card = { ...card, image: { file: './cover.webp' } }
    const throwing = () => renderPng(value)
    const expected = t(locales.errors.webpInPng, { file: './cover.webp' })

    await expect(throwing()).rejects.toThrow(expected)
  })

  it('should throw when the card icon is WebP', async () => {
    const value: Card = { ...card, icon: { file: './logo.webp' } }
    const throwing = () => renderPng(value)
    const expected = t(locales.errors.webpInPng, { file: './logo.webp' })

    await expect(throwing()).rejects.toThrow(expected)
  })

  it('should throw when the header icon is WebP', async () => {
    const value: Card = { ...card, header: { text: 'feedsmith', icon: { file: './logo.webp' } } }
    const throwing = () => renderPng(value)
    const expected = t(locales.errors.webpInPng, { file: './logo.webp' })

    await expect(throwing()).rejects.toThrow(expected)
  })

  it('should throw when the footer icon is WebP', async () => {
    const value: Card = { ...card, footer: { text: 'example/repo', icon: { file: './logo.webp' } } }
    const throwing = () => renderPng(value)
    const expected = t(locales.errors.webpInPng, { file: './logo.webp' })

    await expect(throwing()).rejects.toThrow(expected)
  })

  it('should throw when the background image is WebP', async () => {
    const style = { background: { image: { file: './background.WEBP' } } }
    const throwing = () => renderPng(card, style)
    const expected = t(locales.errors.webpInPng, { file: './background.WEBP' })

    await expect(throwing()).rejects.toThrow(expected)
  })
})
