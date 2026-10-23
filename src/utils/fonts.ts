import type { Font } from 'satori'
import { t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { FontElement, FontFile, FontRole, Fonts } from '../types/index.js'

export type LoadedFonts = {
  fonts: Array<Font>
  families: Record<FontElement, string>
}

export type FontKey = FontRole | FontElement

// Loads a family given by name, under the key's font names.
export type LoadFamily = (
  key: FontKey,
  family: string,
  weights: Array<number>,
) => Promise<{ fonts: Array<Font>; family: string }>

type FontSource = string | Array<FontFile>

const defaultFonts: Record<FontRole, string> = {
  title: 'inter',
  body: 'inter',
  label: 'jetbrains-mono',
}

// The order sets the order of the loaded fonts: title, body, then label.
const elementRoles: Record<FontElement, FontRole> = {
  title: 'title',
  description: 'body',
  header: 'label',
  aside: 'label',
  eyebrow: 'label',
  byline: 'label',
  footer: 'label',
}

const loadFiles = (key: FontKey, files: Array<FontFile>) => {
  if (files.length === 0) {
    throw new Error(t(locales.errors.fontFilesEmpty, { role: key }))
  }

  const fonts: Array<Font> = files.map((file) => {
    return {
      name: key,
      weight: file.weight as Font['weight'],
      style: file.style,
      // Satori takes an ArrayBuffer, and a Uint8Array can view part of a larger one.
      data: new Uint8Array(file.data).buffer,
    }
  })

  return { fonts, family: key }
}

// An element given its own fonts loads them under its own name, and every other element shares
// the fonts of its role. A role or element loads the weights of every element that uses it.
export const loadFonts = async (
  fonts: Fonts | undefined,
  weights: Record<FontElement, Array<number>>,
  loadFamily: LoadFamily,
): Promise<LoadedFonts> => {
  const groups = new Map<FontKey, { source: FontSource; elements: Array<FontElement> }>()

  for (const element of Object.keys(elementRoles) as Array<FontElement>) {
    const role = elementRoles[element]
    // An empty name counts as not given, so the element falls back to its role and the role to
    // the default.
    const own = fonts?.[element] || undefined
    const key = own ? element : role
    const group = groups.get(key) ?? {
      source: own ?? (fonts?.[role] || defaultFonts[role]),
      elements: [],
    }

    group.elements.push(element)
    groups.set(key, group)
  }

  const loaded: LoadedFonts = {
    fonts: [],
    families: {
      title: '',
      description: '',
      header: '',
      aside: '',
      eyebrow: '',
      byline: '',
      footer: '',
    },
  }

  for (const [key, { source, elements }] of groups) {
    const keyWeights = new Set(elements.flatMap((element) => weights[element]))
    const sorted = [...keyWeights].sort((a, b) => a - b)
    const result = Array.isArray(source)
      ? loadFiles(key, source)
      : await loadFamily(key, source, sorted)

    loaded.fonts.push(...result.fonts)

    for (const element of elements) {
      loaded.families[element] = result.family
    }
  }

  return loaded
}
