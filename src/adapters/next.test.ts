import { describe, expect, it } from 'bun:test'
import type { Card } from '../types/index.js'
import { next } from './next.js'

describe('next', () => {
  const resolve = (params: { slug?: string | Array<string> }): Card => {
    return { header: { text: 'feedstand' }, title: `Post ${params.slug}` }
  }

  it('should export the image size and content type for the card', () => {
    const image = next({ sizes: { cardWidth: 600, cardHeight: 315 } }, resolve)
    const expected = {
      size: { width: 600, height: 315 },
      contentType: 'image/png',
    }

    expect(image).toMatchObject(expected)
  })

  it('should resolve the card from the params and respond with a PNG', async () => {
    const image = next({}, resolve)
    const response = await image.default({ params: Promise.resolve({ slug: 'hello' }) })
    const body = new Uint8Array(await response.arrayBuffer())
    const expected = '89504e470d0a1a0a'

    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(Buffer.from(body.subarray(0, 8)).toString('hex')).toBe(expected)
  })
})
