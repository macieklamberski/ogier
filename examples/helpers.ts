import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Extra } from 'ogier'

type Style = Record<string, unknown>

// A satori element for the extra slot, written as a plain object so the examples need no JSX.
export const h = (type: string, style: Style, children?: unknown): Extra => {
  return { type, props: { style, children } }
}

// A Tabler icon as an image element, colored by replacing currentColor in its markup.
export const icon = (name: string, color: string, size = 28): Extra => {
  const path = fileURLToPath(import.meta.resolve(`@tabler/icons/outline/${name}.svg`))
  const svg = readFileSync(path, 'utf8').replaceAll('currentColor', color)
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

  return { type: 'img', props: { src, width: size, height: size } }
}
