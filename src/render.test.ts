import { describe, expect, it } from 'bun:test'
import { renderPng, renderSvg } from './render.js'
import type { Card } from './types/index.js'

const card: Card = {
  name: 'feedsmith',
  eyebrow: 'Guides',
  title: 'Parsing namespaces',
  footer: 'example/repo',
}

describe('renderSvg', () => {
  it('should render a card at the default size', async () => {
    const expected = '<svg width="1200" height="630"'

    expect(await renderSvg(card)).toStartWith(expected)
  })

  it('should render at an overridden size with a logo and a Tabler footer icon', async () => {
    const options = {
      sizes: { cardWidth: 600, cardHeight: 315 },
      logo: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" /></svg>',
      },
      footerIcon: 'brand-github',
    }
    const expected = '<svg width="600" height="315"'

    expect(await renderSvg(card, options)).toStartWith(expected)
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
})
