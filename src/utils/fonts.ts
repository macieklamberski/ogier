import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import type { Font } from 'satori'
import type { FontRole, Fonts } from '../types/index.js'

export type LoadedFonts = {
  fonts: Array<Font>
  families: Record<FontRole, string>
}

const require = createRequire(import.meta.url)
const subsets = ['latin', 'latin-ext']
const defaultFonts: Record<FontRole, string> = {
  title: 'inter',
  label: 'jetbrains-mono',
}

const resolveFontFile = (family: string, subset: string, weight: number): string | undefined => {
  try {
    return require.resolve(`@fontsource/${family}/files/${family}-${subset}-${weight}-normal.woff`)
  } catch {}
}

// Satori keeps one file per font name and weight, so each subset gets its own name and the
// role's family list names them in fallback order.
const loadFamily = async (role: FontRole, family: string, weights: Array<number>) => {
  const fonts: Array<Font> = []
  const names: Array<string> = []

  for (const subset of subsets) {
    const name = `${role}-${subset}`

    for (const weight of weights) {
      const file = resolveFontFile(family, subset, weight)

      if (!file) {
        continue
      }

      fonts.push({ name, weight: weight as Font['weight'], data: await readFile(file) })
    }

    if (fonts.some((font) => font.name === name)) {
      names.push(name)
    }
  }

  if (fonts.length === 0) {
    throw new Error(
      `Font "${family}" has no files for weights ${weights.join(', ')}. Install it: npm install @fontsource/${family}.`,
    )
  }

  return { fonts, family: names.join(', ') }
}

export const loadFonts = async (
  fonts: Fonts | undefined,
  weights: Record<FontRole, Array<number>>,
): Promise<LoadedFonts> => {
  const families = { ...defaultFonts, ...fonts }
  const loaded: LoadedFonts = { fonts: [], families: { title: '', label: '' } }

  for (const role of Object.keys(weights) as Array<FontRole>) {
    const result = await loadFamily(role, families[role], weights[role])

    loaded.fonts.push(...result.fonts)
    loaded.families[role] = result.family
  }

  return loaded
}
