import { describe, expect, it } from 'bun:test'
import type { Font } from 'satori'
import { loadFonts } from './fonts.js'

describe('loadFonts', () => {
  const weights = { title: [400, 700], label: [500] }

  it('should load the default families under their roles', async () => {
    const expected: Array<Font> = [
      { name: 'title', weight: 400, data: expect.any(Buffer) },
      { name: 'title', weight: 400, data: expect.any(Buffer) },
      { name: 'title', weight: 700, data: expect.any(Buffer) },
      { name: 'title', weight: 700, data: expect.any(Buffer) },
      { name: 'label', weight: 500, data: expect.any(Buffer) },
      { name: 'label', weight: 500, data: expect.any(Buffer) },
    ]

    expect(await loadFonts(undefined, weights)).toEqual(expected)
  })

  it('should load a fontsource family given by slug', async () => {
    const value = { label: 'inter' }
    const expected: Array<Font> = [
      { name: 'title', weight: 400, data: expect.any(Buffer) },
      { name: 'title', weight: 400, data: expect.any(Buffer) },
      { name: 'label', weight: 400, data: expect.any(Buffer) },
      { name: 'label', weight: 400, data: expect.any(Buffer) },
    ]

    expect(await loadFonts(value, { title: [400], label: [400] })).toEqual(expected)
  })

  it('should throw with the install command when the family is not installed', () => {
    const value = { title: 'roboto' }
    const throwing = () => loadFonts(value, weights)

    expect(throwing()).rejects.toThrow('npm install @fontsource/roboto')
  })
})
