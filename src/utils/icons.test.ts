import { describe, expect, it } from 'bun:test'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { Icon } from '../types/index.js'
import { loadImage } from './icons.js'

describe('loadImage', () => {
  it('should load an svg file from a package path', async () => {
    const value = { file: '@tabler/icons/outline/brand-github.svg' }
    const expected: Icon = {
      svg: expect.stringContaining('stroke="currentColor"'),
    }

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should replace currentColor in markup with the given color', async () => {
    const value = { svg: '<svg><path fill="currentColor" /></svg>', color: '#ff8c4d' }
    const expected: Icon = {
      svg: '<svg><path fill="#ff8c4d" /></svg>',
    }

    expect(await loadImage(value, value.color)).toEqual(expected)
  })

  it('should keep inline markup as svg text', async () => {
    const value = { svg: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="12" /></svg>' }
    const expected: Icon = {
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="12" /></svg>',
    }

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should decode markup given as bytes', async () => {
    const value = { svg: new TextEncoder().encode('<svg><circle r="12" /></svg>') }
    const expected: Icon = {
      svg: '<svg><circle r="12" /></svg>',
    }

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should embed a bitmap file with the media type of its extension', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const value = { file: join(dir, 'mark.png') }
    const expected: Icon = {
      src: 'data:image/png;base64,iVBORw==',
    }

    await writeFile(value.file, Buffer.from([137, 80, 78, 71]))

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should read the extension from the path of a file url with a query', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const file = join(dir, 'mark.png')
    const value = { file: new URL(`${pathToFileURL(file)}?v=2`) }
    const expected: Icon = {
      src: 'data:image/png;base64,iVBORw==',
    }

    await writeFile(file, Buffer.from([137, 80, 78, 71]))

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should embed image bytes with the given media type', async () => {
    const value = { data: Buffer.from([255, 216, 255, 224]), type: 'image/jpeg' as const }
    const expected: Icon = {
      src: 'data:image/jpeg;base64,/9j/4A==',
    }

    expect(await loadImage(value)).toEqual(expected)
  })

  it('should ignore the color for image bytes', async () => {
    const value = {
      data: Buffer.from([137, 80, 78, 71]),
      type: 'image/png' as const,
      color: '#ff8c4d',
    }
    const expected: Icon = {
      src: 'data:image/png;base64,iVBORw==',
    }

    expect(await loadImage(value, value.color)).toEqual(expected)
  })

  it('should replace currentColor written in lowercase', async () => {
    const value = { svg: '<svg><path fill="currentcolor" /></svg>', color: '#ff8c4d' }
    const expected: Icon = {
      svg: '<svg><path fill="#ff8c4d" /></svg>',
    }

    expect(await loadImage(value, value.color)).toEqual(expected)
  })

  it('should read a path with no leading ./ from the working directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const cwd = process.cwd()
    const value = { file: 'public/logo.svg' }
    const expected: Icon = {
      svg: '<svg><rect /></svg>',
    }

    await mkdir(join(dir, 'public'))
    await writeFile(join(dir, value.file), expected.svg)
    process.chdir(dir)

    try {
      expect(await loadImage(value)).toEqual(expected)
    } finally {
      process.chdir(cwd)
    }
  })

  it('should pass on a read error other than a missing file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const value = { file: join(dir, 'icons.svg') }
    const throwing = () => loadImage(value)

    await mkdir(value.file)

    await expect(throwing()).rejects.toThrow('EISDIR')
  })

  it('should throw for a package path that does not resolve', async () => {
    const value = { file: 'no-such-package/icons/rss.svg' }
    const throwing = () => loadImage(value)

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.iconNotFound, { file: 'no-such-package/icons/rss.svg' }),
    )
  })

  it('should throw for a file in an unsupported format', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const value = { file: join(dir, 'mark.gif') }
    const throwing = () => loadImage(value)

    await writeFile(value.file, Buffer.from('GIF89a'))

    await expect(throwing()).rejects.toThrow(
      t(locales.errors.imageNotSupported, { file: value.file }),
    )
  })
})
