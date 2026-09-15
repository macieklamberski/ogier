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

  it('should throw with the install command when the family is not installed', () => {
    const value = { title: 'roboto' }
    const throwing = () => loadFonts(value, weights)

    expect(throwing()).rejects.toThrow(
      t(locales.errors.fontNotInstalled, { family: 'roboto', weights: '400, 700' }),
    )
  })
})
