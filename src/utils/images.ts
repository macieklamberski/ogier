import { isString } from 'trousse'
import type { Icon, IconRef, ImageRef } from '../types/index.js'

// Loads an image given as a file, which needs a file system.
export type LoadFile = (file: string | URL, color?: string) => Promise<Icon>

const currentColorRegex = /currentColor/g

// btoa takes a binary string, built in chunks so a large image does not overflow the call stack.
export const toDataUri = (data: string | Uint8Array, mimeType: string) => {
  const bytes = isString(data) ? new TextEncoder().encode(data) : data
  let binary = ''

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }

  return `data:${mimeType};base64,${btoa(binary)}`
}

export const colorSvg = (svg: string, color: string | undefined) => {
  return color ? svg.replace(currentColorRegex, color) : svg
}

export const loadImage = (ref: ImageRef, loadFile: LoadFile, color?: string): Promise<Icon> => {
  if ('svg' in ref) {
    const svg = isString(ref.svg) ? ref.svg : new TextDecoder().decode(ref.svg)

    return Promise.resolve({ svg: colorSvg(svg, color) })
  }

  if ('data' in ref) {
    return Promise.resolve({ src: toDataUri(ref.data, ref.type) })
  }

  return loadFile(ref.file, color)
}

export const loadIcon = (ref: IconRef, loadFile: LoadFile): Promise<Icon> => {
  return loadImage(ref, loadFile, ref.color)
}
