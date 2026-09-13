import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, join } from 'node:path'
import type { Icon, IconRef, ImageRef, Node } from '../types/index.js'

type TablerNodes = Record<string, Array<[string, Record<string, string>]>>

const require = createRequire(import.meta.url)
const mimeTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

let tablerNodes: TablerNodes | undefined

const toDataUri = (data: string | Uint8Array, mimeType: string) => {
  return `data:${mimeType};base64,${Buffer.from(data).toString('base64')}`
}

const loadTablerIcon = async (name: string): Promise<Icon> => {
  if (!tablerNodes) {
    let iconFile: string

    try {
      iconFile = require.resolve(`@tabler/icons/outline/${name}.svg`)
    } catch (error) {
      throw new Error(
        `Icon "${name}" is not in @tabler/icons. Install it: npm install @tabler/icons.`,
        {
          cause: error,
        },
      )
    }

    // The package exports only icons/*, so the node table is reached from a resolved icon.
    const nodesFile = join(iconFile, '../../../tabler-nodes-outline.json')

    tablerNodes = JSON.parse(await readFile(nodesFile, 'utf8'))
  }

  const nodes = tablerNodes?.[name]

  if (!nodes) {
    throw new Error(`Icon "${name}" is not in @tabler/icons.`)
  }

  const children: Array<Node> = nodes.map(([type, props]) => ({ type, props }))

  return { children }
}

export const loadImage = async (ref: ImageRef): Promise<Icon> => {
  if ('svg' in ref) {
    return { src: toDataUri(ref.svg, 'image/svg+xml') }
  }

  const mimeType = mimeTypes[extname(ref.file.toString()).toLowerCase()] ?? 'image/svg+xml'

  return { src: toDataUri(await readFile(ref.file), mimeType) }
}

export const loadIcon = (ref: IconRef): Promise<Icon> => {
  if (typeof ref === 'string') {
    return loadTablerIcon(ref)
  }

  return loadImage(ref)
}
