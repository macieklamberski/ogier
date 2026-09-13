import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import type { Icon, Node } from '../types/index.js'

type TablerNodes = Record<string, Array<[string, Record<string, string>]>>

const require = createRequire(import.meta.url)

let tablerNodes: TablerNodes | undefined

export const loadIcon = async (name: string): Promise<Icon> => {
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
