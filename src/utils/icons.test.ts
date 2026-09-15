import { describe, expect, it } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { Icon } from '../types/index.js'
import { loadIcon } from './icons.js'

describe('loadIcon', () => {
  it('should load an svg file from a package path', async () => {
    const value = { file: '@tabler/icons/outline/brand-github.svg' }
    const expected: Icon = {
      svg: expect.stringContaining('stroke="currentColor"'),
    }

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should replace currentColor in markup with the given color', async () => {
    const value = { svg: '<svg><path fill="currentColor" /></svg>', color: '#ff8c4d' }
    const expected: Icon = {
      svg: '<svg><path fill="#ff8c4d" /></svg>',
    }

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should keep inline markup as svg text', async () => {
    const value = { svg: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="12" /></svg>' }
    const expected: Icon = {
      svg: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="12" /></svg>',
    }

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should embed a bitmap file with the media type of its extension', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const value = { file: join(dir, 'mark.png') }
    const expected: Icon = {
      src: 'data:image/png;base64,iVBORw==',
    }

    await writeFile(value.file, Buffer.from([137, 80, 78, 71]))

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should throw for a package path that does not resolve', () => {
    const value = { file: 'no-such-package/icons/rss.svg' }
    const throwing = () => loadIcon(value)

    expect(throwing()).rejects.toThrow(
      t(locales.errors.iconNotFound, { file: 'no-such-package/icons/rss.svg' }),
    )
  })
})
