import { describe, expect, it } from 'bun:test'
import { loadIcon, toDataUri } from './images.js'

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

describe('loadIcon', () => {
  const loadFile = () => Promise.reject(new Error('A file should not be read'))

  it('should return an element with its color as it is', async () => {
    const element = { type: 'svg', props: { viewBox: '0 0 8 8' } }
    const value = { element, color: '#123456' }
    const expected = { element, color: '#123456' }

    expect(await loadIcon(value, loadFile)).toEqual(expected)
  })

  it('should load an image ref in its color', async () => {
    const value = { svg: '<svg><path fill="currentColor" /></svg>', color: '#123456' }
    const expected = { svg: '<svg><path fill="#123456" /></svg>' }

    expect(await loadIcon(value, loadFile)).toEqual(expected)
  })
})
