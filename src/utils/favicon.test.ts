import { describe, expect, it } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import locales from '../locales.json' with { type: 'json' }
import { renderFavicon } from './favicon.js'

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#ff6602" /></svg>'

describe('renderFavicon', () => {
  it('should render a square png at the default size', async () => {
    const png = await renderFavicon({ svg })

    expect(png.subarray(0, 8)).toEqual(pngSignature)
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([192, 192])
  })

  it('should render at the given size', async () => {
    const png = await renderFavicon({ svg }, 48)

    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([48, 48])
  })

  it('should reject markup that is not svg', async () => {
    const throwing = () => renderFavicon({ svg: 'not svg' })

    await expect(throwing()).rejects.toThrow()
  })

  it('should reject a raster file', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'ogier-')), 'icon.png')

    await writeFile(file, Buffer.from([137, 80, 78, 71]))

    const throwing = () => renderFavicon({ file })

    await expect(throwing()).rejects.toThrow(locales.errors.faviconNeedsSvg)
  })
})
