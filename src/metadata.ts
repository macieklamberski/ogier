import { docsSizes } from './layouts/docs.js'
import type { Metadata, MetadataInput } from './types/index.js'

const slashRegex = /\//g
const trailingSlashRegex = /\/$/

export const getImageUrl = (hostname: string, path: string, dir = 'og'): string => {
  return `${hostname.replace(trailingSlashRegex, '')}/${dir}/${path.replace(slashRegex, '-')}.png`
}

export const getMetadata = (input: MetadataInput): Metadata => {
  const image = typeof input.image === 'string' ? { url: input.image } : input.image

  return {
    type: input.type ?? 'website',
    url: input.url,
    title: input.title,
    description: input.description,
    image: {
      url: image.url ?? '',
      width: image.width ?? docsSizes.cardWidth,
      height: image.height ?? docsSizes.cardHeight,
      alt: image.alt ?? input.title,
    },
    twitterCard: 'summary_large_image',
  }
}
