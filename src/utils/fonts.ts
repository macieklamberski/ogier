import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import type { Font } from 'satori'
import type { FontRole, Fonts } from '../types/index.js'

const require = createRequire(import.meta.url)
const defaultFonts: Record<FontRole, string> = {
  title: 'inter',
  label: 'jetbrains-mono',
}

const resolveFontFile = (family: string, weight: number): string | undefined => {
  try {
    return require.resolve(`@fontsource/${family}/files/${family}-latin-${weight}-normal.woff`)
  } catch {}
}

const loadFamily = async (role: FontRole, family: string, weights: Array<number>) => {
  const fonts: Array<Font> = []

  for (const weight of weights) {
    const file = resolveFontFile(family, weight)

    if (!file) {
      continue
    }

    fonts.push({ name: role, weight: weight as Font['weight'], data: await readFile(file) })
  }

  if (fonts.length === 0) {
    throw new Error(
      `Font "${family}" has no files for weights ${weights.join(', ')}. Install it: npm install @fontsource/${family}.`,
    )
  }

  return fonts
}

export const loadFonts = async (
  fonts: Fonts | undefined,
  weights: Record<FontRole, Array<number>>,
): Promise<Array<Font>> => {
  const families = { ...defaultFonts, ...fonts }
  const loaded: Array<Font> = []

  for (const role of Object.keys(weights) as Array<FontRole>) {
    loaded.push(...(await loadFamily(role, families[role], weights[role])))
  }

  return loaded
}
