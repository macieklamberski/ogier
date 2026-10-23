import { describe, expect, it } from 'bun:test'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { LoadedFonts } from './fonts.js'
import { loadFonts } from './fonts.js'

describe('loadFonts', () => {
  const weights = { title: [400, 700], body: [400], label: [500] }

  it('should load the default families with one name per subset', async () => {
    const expected: LoadedFonts = {
      fonts: [
        { name: 'title-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'title-latin', weight: 700, data: expect.any(Buffer) },
        { name: 'title-latin-ext', weight: 400, data: expect.any(Buffer) },
        { name: 'title-latin-ext', weight: 700, data: expect.any(Buffer) },
        { name: 'body-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'body-latin-ext', weight: 400, data: expect.any(Buffer) },
        { name: 'label-latin', weight: 500, data: expect.any(Buffer) },
        { name: 'label-latin-ext', weight: 500, data: expect.any(Buffer) },
      ],
      families: {
        title: 'title-latin, title-latin-ext',
        body: 'body-latin, body-latin-ext',
        label: 'label-latin, label-latin-ext',
      },
    }

    expect(await loadFonts(undefined, weights)).toEqual(expected)
  })

  it('should load a fontsource family given by slug', async () => {
    const value = { body: 'jetbrains-mono', label: 'inter' }
    const expected: LoadedFonts = {
      fonts: [
        { name: 'title-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'title-latin-ext', weight: 400, data: expect.any(Buffer) },
        { name: 'body-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'body-latin-ext', weight: 400, data: expect.any(Buffer) },
        { name: 'label-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'label-latin-ext', weight: 400, data: expect.any(Buffer) },
      ],
      families: {
        title: 'title-latin, title-latin-ext',
        body: 'body-latin, body-latin-ext',
        label: 'label-latin, label-latin-ext',
      },
    }

    expect(await loadFonts(value, { title: [400], body: [400], label: [400] })).toEqual(expected)
  })

  it('should use the font files given for a role under the role name', async () => {
    const value = {
      title: [
        { data: new Uint8Array([1, 2, 3]), weight: 700 },
        { data: new Uint8Array([4, 5, 6]).buffer, weight: 400, style: 'italic' as const },
      ],
    }
    const expected: LoadedFonts = {
      fonts: [
        { name: 'title', weight: 700, data: new Uint8Array([1, 2, 3]).buffer },
        { name: 'title', weight: 400, style: 'italic', data: new Uint8Array([4, 5, 6]).buffer },
        { name: 'body-latin', weight: 400, data: expect.any(Buffer) },
        { name: 'body-latin-ext', weight: 400, data: expect.any(Buffer) },
        { name: 'label-latin', weight: 500, data: expect.any(Buffer) },
        { name: 'label-latin-ext', weight: 500, data: expect.any(Buffer) },
      ],
      families: {
        title: 'title',
        body: 'body-latin, body-latin-ext',
        label: 'label-latin, label-latin-ext',
      },
    }

    expect(await loadFonts(value, weights)).toEqual(expected)
  })

  it('should copy only the viewed bytes of a font file', async () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 0])
    const value = { label: [{ data: bytes.subarray(1, 4), weight: 500 }] }
    const expected = new Uint8Array([1, 2, 3]).buffer

    const { fonts } = await loadFonts(value, { title: [400], body: [400], label: [500] })

    expect(fonts.at(-1)?.data).toEqual(expected)
  })

  it('should throw when a role is given an empty list of font files', async () => {
    const value = { body: [] }
    const throwing = () => loadFonts(value, weights)

    await expect(throwing()).rejects.toThrow(t(locales.errors.fontFilesEmpty, { role: 'body' }))
  })

  it('should throw with the install command when the family is not installed', async () => {
    const value = { title: 'roboto' }
    const throwing = () => loadFonts(value, weights)

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.fontNotInstalled, { family: 'roboto', weights: '400, 700' }),
    )
  })
})
