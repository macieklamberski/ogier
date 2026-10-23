import { describe, expect, it } from 'bun:test'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { LoadedFonts } from './fonts.js'
import { loadFonts } from './fonts.js'
import { loadFontsourceFamily } from './fontsource.js'

describe('loadFonts', () => {
  const weights = {
    title: [400, 700],
    description: [400],
    header: [500],
    aside: [500],
    eyebrow: [500],
    byline: [500],
    footer: [500],
  }
  const labelFamilies = {
    header: 'label-latin, label-latin-ext',
    aside: 'label-latin, label-latin-ext',
    eyebrow: 'label-latin, label-latin-ext',
    byline: 'label-latin, label-latin-ext',
    footer: 'label-latin, label-latin-ext',
  }

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
        description: 'body-latin, body-latin-ext',
        ...labelFamilies,
      },
    }

    expect(await loadFonts(undefined, weights, loadFontsourceFamily)).toEqual(expected)
  })

  it('should load a fontsource family given by slug', async () => {
    const value = { body: 'jetbrains-mono', label: 'inter' }
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
        description: 'body-latin, body-latin-ext',
        ...labelFamilies,
      },
    }

    expect(await loadFonts(value, weights, loadFontsourceFamily)).toEqual(expected)
  })

  it('should load an element family under the element name', async () => {
    const value = { eyebrow: 'inter' }
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
        { name: 'eyebrow-latin', weight: 500, data: expect.any(Buffer) },
        { name: 'eyebrow-latin-ext', weight: 500, data: expect.any(Buffer) },
      ],
      families: {
        title: 'title-latin, title-latin-ext',
        description: 'body-latin, body-latin-ext',
        ...labelFamilies,
        eyebrow: 'eyebrow-latin, eyebrow-latin-ext',
      },
    }

    expect(await loadFonts(value, weights, loadFontsourceFamily)).toEqual(expected)
  })

  it('should load the weights of every element sharing a role', async () => {
    const value = { ...weights, eyebrow: [700], footer: [400] }
    const expected = [400, 500, 700] as const

    const { fonts } = await loadFonts(undefined, value, loadFontsourceFamily)
    const labelWeights = fonts
      .filter((font) => font.name === 'label-latin')
      .map((font) => font.weight)

    expect(labelWeights).toEqual([...expected])
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
        description: 'body-latin, body-latin-ext',
        ...labelFamilies,
      },
    }

    expect(await loadFonts(value, weights, loadFontsourceFamily)).toEqual(expected)
  })

  it('should use the font files given for an element under the element name', async () => {
    const value = { byline: [{ data: new Uint8Array([1, 2, 3]), weight: 400 }] }
    const expected = {
      name: 'byline',
      weight: 400 as const,
      data: new Uint8Array([1, 2, 3]).buffer,
    }

    const { fonts, families } = await loadFonts(value, weights, loadFontsourceFamily)

    expect(fonts.at(-1)).toEqual(expected)
    expect(families.byline).toBe('byline')
  })

  it('should copy only the viewed bytes of a font file', async () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 0])
    const value = { label: [{ data: bytes.subarray(1, 4), weight: 500 }] }
    const expected = new Uint8Array([1, 2, 3]).buffer

    const { fonts } = await loadFonts(value, weights, loadFontsourceFamily)

    expect(fonts.at(-1)?.data).toEqual(expected)
  })

  it('should load the default family for a role given as undefined', async () => {
    const value = { title: undefined }
    const expected = {
      title: 'title-latin, title-latin-ext',
      description: 'body-latin, body-latin-ext',
      ...labelFamilies,
    }

    const { families } = await loadFonts(value, weights, loadFontsourceFamily)

    expect(families).toEqual(expected)
  })

  it('should throw when a role is given an empty list of font files', async () => {
    const value = { body: [] }
    const throwing = () => loadFonts(value, weights, loadFontsourceFamily)

    await expect(throwing()).rejects.toThrow(t(locales.errors.fontFilesEmpty, { role: 'body' }))
  })

  it('should throw with the install command when the family is not installed', async () => {
    const value = { title: 'roboto' }
    const throwing = () => loadFonts(value, weights, loadFontsourceFamily)

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.fontNotInstalled, { family: 'roboto', weights: '400, 700' }),
    )
  })
})
