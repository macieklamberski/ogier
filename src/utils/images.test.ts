import { describe, expect, it } from 'bun:test'
import { toDataUri } from './images.js'

describe('toDataUri', () => {
  it('should encode text as UTF-8', () => {
    const value = '<svg><text>Zażółć</text></svg>'
    const expected = 'data:image/svg+xml;base64,PHN2Zz48dGV4dD5aYcW8w7PFgsSHPC90ZXh0Pjwvc3ZnPg=='

    expect(toDataUri(value, 'image/svg+xml')).toBe(expected)
  })

  it('should encode bytes larger than one chunk', () => {
    const value = new Uint8Array(70000).map((_, index) => index % 256)
    const expected = `data:image/png;base64,${Buffer.from(value).toString('base64')}`

    expect(toDataUri(value, 'image/png')).toBe(expected)
  })
})
