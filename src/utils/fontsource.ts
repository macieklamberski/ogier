import { readFile } from 'node:fs/promises'
import type { Font } from 'satori'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { LoadFamily } from './fonts.js'
import { resolvePackageFile } from './packages.js'

const subsets = ['latin', 'latin-ext']

const resolveFontFile = (family: string, subset: string, weight: number) => {
  return resolvePackageFile(`@fontsource/${family}/files/${family}-${subset}-${weight}-normal.woff`)
}

// Satori keeps one file per font name and weight, so each subset gets its own name and the
// role's family list names them in fallback order.
export const loadFontsourceFamily: LoadFamily = async (key, family, weights) => {
  const fonts: Array<Font> = []
  const names: Array<string> = []

  for (const subset of subsets) {
    const name = `${key}-${subset}`

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
    throw new Error(t(locales.errors.fontNotInstalled, { family, weights: weights.join(', ') }))
  }

  return { fonts, family: names.join(', ') }
}
