export type MetadataImage = {
  url: string
  width: number
  height: number
  alt: string
}

export type Metadata = {
  type: string
  url: string
  title: string
  description?: string
  image: MetadataImage
  twitterCard: 'summary_large_image'
}

export type MetadataInput = {
  type?: string
  url: string
  title: string
  description?: string
  image: string | (Partial<MetadataImage> & { url: string })
}

export type MetaTag = ['meta', Record<string, string>]
