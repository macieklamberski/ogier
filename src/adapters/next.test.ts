import { describe, expect, it } from 'bun:test'
import type { Card } from '../types/index.js'
import type { NextImage } from './next.js'
import { next } from './next.js'

describe('next', () => {
  const getCard = (params: { slug?: string | Array<string> }): Card => {
    return { header: { text: 'feedstand' }, title: `Post ${params.slug}` }
  }

  it('should export the image size and content type for the card', () => {
    const image = next({ style: { sizes: { cardWidth: 600, cardHeight: 315 } }, card: getCard })
    const expected: NextImage = {
      default: expect.any(Function),
      size: { width: 600, height: 315 },
      contentType: 'image/png',
    }

    expect(image).toEqual(expected)
  })

  it('should resolve the card from the params and respond with a PNG', async () => {
    const image = next({ card: getCard })
    const response = await image.default({ params: Promise.resolve({ slug: 'hello' }) })
    const body = new Uint8Array(await response.arrayBuffer())
    const expected = '89504e470d0a1a0a'

    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(Buffer.from(body.subarray(0, 8)).toString('hex')).toBe(expected)
  })

  it('should add the headers from the options to the response', async () => {
    const image = next({ card: getCard, headers: { 'Cache-Control': 'public, max-age=86400' } })
    const response = await image.default({ params: Promise.resolve({ slug: 'hello' }) })
    const expected = 'public, max-age=86400'

    expect(response.headers.get('Cache-Control')).toBe(expected)
  })

  it('should keep the PNG content type when the headers set another one', async () => {
    const image = next({ card: getCard, headers: { 'Content-Type': 'text/plain' } })
    const response = await image.default({ params: Promise.resolve({ slug: 'hello' }) })
    const expected = 'image/png'

    expect(response.headers.get('Content-Type')).toBe(expected)
  })

  it('should take the style as the first of two arguments', () => {
    const image = next({ sizes: { cardWidth: 600, cardHeight: 315 } }, getCard)
    const expected = { width: 600, height: 315 }

    expect(image.size).toEqual(expected)
  })

  it('should render the card from the resolve function as the second of two arguments', async () => {
    const image = next({}, getCard)
    const response = await image.default({ params: Promise.resolve({ slug: 'hello' }) })

    expect(response.headers.get('Content-Type')).toBe('image/png')
  })
})
