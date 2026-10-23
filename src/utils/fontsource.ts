import { readFile } from 'node:fs/promises'
import type { Font } from 'satori'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { LoadFamily } from './fonts.js'
import { resolvePackageFile } from './packages.js'

const subsets = ['latin', 'latin-ext']
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const resolveFontFile = (family: string, subset: string, weight: number) => {
  return resolvePackageFile(`@fontsource/${family}/files/${family}-${subset}-${weight}-normal.woff`)
}

// A family that does not ship a weight falls back to the nearest one it does, the lighter on a tie,
// so Space Mono, which has 400 and 700 only, draws a 500 label in 400.
const findNearestFile = (family: string, subset: string, weight: number) => {
  const nearest = [...fontWeights].sort(
    (a, b) => Math.abs(a - weight) - Math.abs(b - weight) || a - b,
  )

  for (const candidate of nearest) {
    const file = resolveFontFile(family, subset, candidate)

    if (file) {
      return { weight: candidate, file }
    }
  }
}

// Satori keeps one file per font name and weight, so each subset gets its own name and the
// role's family list names them in fallback order.
export const loadFontsourceFamily: LoadFamily = async (key, family, weights) => {
  const fonts: Array<Font> = []
  const names: Array<string> = []

  for (const subset of subsets) {
    const name = `${key}-${subset}`
    const loaded = new Set<number>()

    for (const weight of weights) {
      const nearest = findNearestFile(family, subset, weight)

      if (!nearest || loaded.has(nearest.weight)) {
        continue
      }

      loaded.add(nearest.weight)
      fonts.push({
        name,
        weight: nearest.weight as Font['weight'],
        data: await readFile(nearest.file),
      })
    }

    if (fonts.some((font) => font.name === name)) {
      names.push(name)
    }
  }

  if (fonts.length === 0) {
    throw new Error(t(locales.errors.fontNotInstalled, { family }))
  }

  return { fonts, family: names.join(', ') }
}
