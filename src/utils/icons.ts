import { readFile } from 'node:fs/promises'
import { extname, isAbsolute } from 'node:path'
import { isString, t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { Icon, IconRef, ImageRef } from '../types/index.js'
import { resolvePackageFile } from './packages.js'

const currentColorRegex = /currentColor/g
const relativeRegex = /^\.\.?\//
const mimeTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

const isPackagePath = (file: string | URL): file is string => {
  return isString(file) && !isAbsolute(file) && !relativeRegex.test(file)
}

const resolveFile = (file: string | URL): string | URL => {
  if (!isPackagePath(file)) {
    return file
  }

  const resolved = resolvePackageFile(file)

  if (!resolved) {
    throw new Error(t(locales.errors.iconNotFound, { file }))
  }

  return resolved
}

export const getExtension = (file: string | URL) => {
  return extname(isString(file) ? file : file.pathname).toLowerCase()
}

export const toDataUri = (data: string | Uint8Array, mimeType: string) => {
  return `data:${mimeType};base64,${Buffer.from(data).toString('base64')}`
}

export const colorSvg = (svg: string, color: string | undefined) => {
  return color ? svg.replace(currentColorRegex, color) : svg
}

export const loadImage = async (ref: ImageRef, color?: string): Promise<Icon> => {
  if ('svg' in ref) {
    const svg = isString(ref.svg) ? ref.svg : new TextDecoder().decode(ref.svg)

    return { svg: colorSvg(svg, color) }
  }

  if ('data' in ref) {
    return { src: toDataUri(ref.data, ref.type) }
  }

  const extension = getExtension(ref.file)
  // A file with no extension is read as SVG.
  const mimeType = extension ? mimeTypes[extension] : 'image/svg+xml'

  if (!mimeType) {
    throw new Error(t(locales.errors.imageNotSupported, { file: ref.file.toString() }))
  }

  const data = await readFile(resolveFile(ref.file))

  if (mimeType === 'image/svg+xml') {
    return { svg: colorSvg(data.toString(), color) }
  }

  return { src: toDataUri(data, mimeType) }
}

export const loadIcon = (ref: IconRef): Promise<Icon> => {
  return loadImage(ref, ref.color)
}
