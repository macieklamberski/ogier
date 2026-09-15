import { isString } from 'trousse'
import { defaultSizes } from './layout.js'
import type { Metadata, MetadataInput, MetaTag } from './types/index.js'

const slashRegex = /\//g
const trailingSlashRegex = /\/$/

export const getImageUrl = (hostname: string, path: string, dir = 'og'): string => {
  return `${hostname.replace(trailingSlashRegex, '')}/${dir}/${path.replace(slashRegex, '-')}.png`
}

export const composeMetadata = (input: MetadataInput): Metadata => {
  const image = isString(input.image) ? { url: input.image } : input.image

  return {
    type: input.type ?? 'website',
    url: input.url,
    title: input.title,
    description: input.description,
    image: {
      url: image.url,
      width: image.width ?? defaultSizes.cardWidth,
      height: image.height ?? defaultSizes.cardHeight,
      alt: image.alt ?? input.title,
    },
    twitterCard: 'summary_large_image',
  }
}

export const composeMetaTags = (metadata: Metadata): Array<MetaTag> => {
  const tags: Array<MetaTag> = [
    ['meta', { property: 'og:type', content: metadata.type }],
    ['meta', { property: 'og:url', content: metadata.url }],
    ['meta', { property: 'og:title', content: metadata.title }],
  ]

  if (metadata.description) {
    tags.push(['meta', { property: 'og:description', content: metadata.description }])
  }

  tags.push(
    ['meta', { property: 'og:image', content: metadata.image.url }],
    ['meta', { property: 'og:image:width', content: String(metadata.image.width) }],
    ['meta', { property: 'og:image:height', content: String(metadata.image.height) }],
    ['meta', { property: 'og:image:alt', content: metadata.image.alt }],
    ['meta', { name: 'twitter:card', content: metadata.twitterCard }],
    ['meta', { name: 'twitter:title', content: metadata.title }],
  )

  if (metadata.description) {
    tags.push(['meta', { name: 'twitter:description', content: metadata.description }])
  }

  tags.push(['meta', { name: 'twitter:image', content: metadata.image.url }])

  return tags
}
