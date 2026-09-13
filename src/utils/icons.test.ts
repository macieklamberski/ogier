import { describe, expect, it } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Icon } from '../types/index.js'
import { loadIcon } from './icons.js'

describe('loadIcon', () => {
  it('should load a Tabler icon as inline nodes', async () => {
    const value = 'brand-github'
    const expected: Icon = {
      children: [{ type: 'path', props: { d: expect.any(String) } }],
    }

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should embed inline markup as a data URI', async () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle r="12" /></svg>'
    const value = { svg }
    const expected: Icon = {
      src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    }

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should embed a file with the media type of its extension', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ogier-'))
    const value = { file: join(dir, 'mark.png') }
    const expected: Icon = {
      src: 'data:image/png;base64,iVBORw==',
    }

    await writeFile(value.file, Buffer.from([137, 80, 78, 71]))

    expect(await loadIcon(value)).toEqual(expected)
  })

  it('should throw for a Tabler icon name that does not exist', () => {
    const value = 'brand-nothing-here'
    const throwing = () => loadIcon(value)

    expect(throwing()).rejects.toThrow('Icon "brand-nothing-here" is not in @tabler/icons.')
  })
})
