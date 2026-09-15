import { afterEach, describe, expect, it } from 'bun:test'
import { mkdir, mkdtemp, realpath, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolvePackageFile } from './packages.js'

describe('resolvePackageFile', () => {
  const initialDir = process.cwd()

  afterEach(() => {
    process.chdir(initialDir)
  })

  it('should resolve a package installed in the working directory', async () => {
    const dir = await realpath(await mkdtemp(join(tmpdir(), 'ogier-')))
    const packageDir = join(dir, 'node_modules', '@example', 'marks')
    const expected = join(packageDir, 'rss.svg')

    await mkdir(packageDir, { recursive: true })
    await writeFile(join(packageDir, 'package.json'), '{"name":"@example/marks"}')
    await writeFile(expected, '<svg />')
    process.chdir(dir)

    expect(resolvePackageFile('@example/marks/rss.svg')).toBe(expected)
  })

  it('should fall back to the packages ogier depends on', async () => {
    process.chdir(await mkdtemp(join(tmpdir(), 'ogier-')))

    expect(resolvePackageFile('@fontsource/inter/package.json')).toEndWith(
      join('node_modules', '@fontsource', 'inter', 'package.json'),
    )
  })

  it('should return undefined for a package installed nowhere', () => {
    expect(resolvePackageFile('no-such-package/rss.svg')).toBeUndefined()
  })
})
