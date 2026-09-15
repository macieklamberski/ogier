import { mkdir, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const presetsDir = join(import.meta.dir, 'presets')
const outputDir = join(import.meta.dir, 'output')
const glob = new Bun.Glob('*.ts')

await mkdir(outputDir, { recursive: true })

for await (const file of glob.scan(presetsDir)) {
  const { png } = await import(join(presetsDir, file))

  await writeFile(join(outputDir, `${basename(file, '.ts')}.png`), png)
}
