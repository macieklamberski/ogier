import { readFile } from 'node:fs/promises'
import { extname, isAbsolute } from 'node:path'
import { isString, t } from 'trousse'
import locales from '../locales.json' with { type: 'json' }
import type { Icon, IconRef, ImageRef } from '../types/index.js'
import * as images from './images.js'
import { resolvePackageFile } from './packages.js'

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

export const loadImageFile: images.LoadFile = async (file, color) => {
  const extension = getExtension(file)
  // A file with no extension is read as SVG.
  const mimeType = extension ? mimeTypes[extension] : 'image/svg+xml'

  if (!mimeType) {
    throw new Error(t(locales.errors.imageNotSupported, { file: file.toString() }))
  }

  const data = await readFile(resolveFile(file))

  if (mimeType === 'image/svg+xml') {
    return { svg: images.colorSvg(data.toString(), color) }
  }

  return { src: images.toDataUri(data, mimeType) }
}

export const loadImage = (ref: ImageRef, color?: string): Promise<Icon> => {
  return images.loadImage(ref, loadImageFile, color)
}

export const loadIcon = (ref: IconRef): Promise<Icon> => {
  return images.loadIcon(ref, loadImageFile)
}
