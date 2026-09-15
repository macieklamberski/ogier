import { describe, expect, it } from 'bun:test'
import { composeMetadata, composeMetaTags, getImageUrl } from './metadata.js'
import type { Metadata, MetaTag } from './types/index.js'

describe('getImageUrl', () => {
  it('should turn the page path into a dashed png under the image dir', () => {
    const value = 'guides/customization/fetching'
    const expected = 'https://example.com/og/guides-customization-fetching.png'

    expect(getImageUrl('https://example.com', value)).toBe(expected)
  })

  it('should drop a trailing slash from the hostname and take a custom dir', () => {
    const value = 'index'
    const expected = 'https://example.com/cards/index.png'

    expect(getImageUrl('https://example.com/', value, 'cards')).toBe(expected)
  })
})

describe('composeMetadata', () => {
  it('should keep every field with all properties', () => {
    const value = {
      type: 'article',
      url: 'https://example.com/post',
      title: 'Post',
      description: 'A post.',
      image: {
        url: 'https://example.com/post.png',
        width: 800,
        height: 400,
        alt: 'Cover',
      },
    }
    const expected: Metadata = {
      type: 'article',
      url: 'https://example.com/post',
      title: 'Post',
      description: 'A post.',
      image: {
        url: 'https://example.com/post.png',
        width: 800,
        height: 400,
        alt: 'Cover',
      },
      twitterCard: 'summary_large_image',
    }

    expect(composeMetadata(value)).toEqual(expected)
  })

  it('should fill the defaults with minimal properties', () => {
    const value = {
      url: 'https://example.com/guides/parsing',
      title: 'Parsing',
      image: 'https://example.com/og/guides-parsing.png',
    }
    const expected: Metadata = {
      type: 'website',
      url: 'https://example.com/guides/parsing',
      title: 'Parsing',
      image: {
        url: 'https://example.com/og/guides-parsing.png',
        width: 1200,
        height: 630,
        alt: 'Parsing',
      },
      twitterCard: 'summary_large_image',
    }

    expect(composeMetadata(value)).toEqual(expected)
  })
})

describe('composeMetaTags', () => {
  const value: Metadata = {
    type: 'website',
    url: 'https://example.com/guides/parsing',
    title: 'Parsing',
    description: 'How parsing works.',
    image: {
      url: 'https://example.com/og/guides-parsing.png',
      width: 1200,
      height: 630,
      alt: 'Parsing',
    },
    twitterCard: 'summary_large_image',
  }

  it('should emit the Open Graph and Twitter tags with all properties', () => {
    const expected: Array<MetaTag> = [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:url', content: 'https://example.com/guides/parsing' }],
      ['meta', { property: 'og:title', content: 'Parsing' }],
      ['meta', { property: 'og:description', content: 'How parsing works.' }],
      ['meta', { property: 'og:image', content: 'https://example.com/og/guides-parsing.png' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: 'Parsing' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: 'Parsing' }],
      ['meta', { name: 'twitter:description', content: 'How parsing works.' }],
      ['meta', { name: 'twitter:image', content: 'https://example.com/og/guides-parsing.png' }],
    ]

    expect(composeMetaTags(value)).toEqual(expected)
  })

  it('should skip the description tags when there is no description', () => {
    const expected: Array<MetaTag> = [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:url', content: 'https://example.com/guides/parsing' }],
      ['meta', { property: 'og:title', content: 'Parsing' }],
      ['meta', { property: 'og:image', content: 'https://example.com/og/guides-parsing.png' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: 'Parsing' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: 'Parsing' }],
      ['meta', { name: 'twitter:image', content: 'https://example.com/og/guides-parsing.png' }],
    ]

    expect(composeMetaTags({ ...value, description: undefined })).toEqual(expected)
  })
})
