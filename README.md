# Ogier

[![codecov](https://codecov.io/gh/macieklamberski/ogier/branch/main/graph/badge.svg)](https://codecov.io/gh/macieklamberski/ogier)
[![npm version](https://img.shields.io/npm/v/ogier.svg)](https://www.npmjs.com/package/ogier)
[![license](https://img.shields.io/npm/l/ogier.svg)](https://github.com/macieklamberski/ogier/blob/main/LICENSE)

Easily generate Open Graph images from text, icons and fonts, with ready-made layouts and themes, and adapters for your site framework.

Ogier turns a title, a description and an icon into the image a page shows when it is shared: a 1200 by 630 PNG in your fonts and colors. Icons come from any SVG file, your own or one from an icon package like Tabler or Lucide. The VitePress and Next adapters render a card for every page and write the tags that point at it.

## Installation

```bash
npm install ogier
```

## Quick Start

```typescript
import { writeFile } from 'node:fs/promises'
import { renderPng } from 'ogier'

const png = await renderPng({
  header: { text: 'feedsmith', icon: { file: './public/favicon.svg' } },
  eyebrow: 'Guides › Parsing',
  title: 'Parsing namespaces',
  footer: { text: 'macieklamberski/feedsmith', icon: { file: '@tabler/icons/outline/brand-github.svg' } },
})

await writeFile('og/guides-parsing.png', png)
```

## Examples

Each card below is rendered from a preset in [examples](examples). Click a card to see its source.

| | |
|---|---|
| [![Docs page on a dark theme with the dot rail](examples/output/docs.png)](examples/presets/docs.ts) | [![Book club card in Young Serif and IBM Plex Mono on red with a painting on the right](examples/output/bookclub.png)](examples/presets/bookclub.ts) |
| [![Essay in DM Serif Display and Inter with a still life on the left and right-aligned text](examples/output/editorial.png)](examples/presets/editorial.ts) | [![Blog post in Literata and DM Sans with the headline at the bottom and an accent bar](examples/output/post.png)](examples/presets/post.ts) |
| [![Wordmark card in JetBrains Mono](examples/output/wordmark.png)](examples/presets/wordmark.ts) | [![Research post in Epunda Slab with yellow text over a full-bleed aerial photo of a river](examples/output/cover.png)](examples/presets/cover.ts) |
| [![Changelog card in Space Mono and Space Grotesk on blue with the dot rail](examples/output/launch.png)](examples/presets/launch.ts) | [![Personal card with an icon and a name and role in Commit Mono](examples/output/personal.png)](examples/presets/personal.ts) |
| [![Landing page in Bricolage Grotesque with centered text](examples/output/centered.png)](examples/presets/centered.ts) | [![Research post in Geist and Geist Mono on black with a paint swirl on the right](examples/output/research.png)](examples/presets/research.ts) |

## API

### `renderPng(card, style?)` and `renderSvg(card, style?)`

Render one card. Both take the same arguments and give back a PNG buffer or an SVG string.

The card is what the image says:

```typescript
type Card = {
  header?: { text?: string; icon?: IconRef; aside?: string }
  eyebrow?: string
  title?: string
  byline?: string
  description?: string
  footer?: { text?: string; icon?: IconRef; aside?: string }
  image?: ImageRef & { position?: 'left' | 'right' }
  align?: { horizontal?: 'left' | 'center' | 'right'; vertical?: 'top' | 'center' | 'bottom' }
}
```

- `title` and `description`: at least one of them. A description alone takes the title's place, which is what a home page wants.
- `header` and `footer`: a line with a text, an icon, or both. `aside` sits at the far end of the line, for a date or a version. An icon alone makes a wordmark line.
- `eyebrow`: the short line above the title, for a section name or a category.
- `byline`: the line under the title, for an author or a source.
- `image`: a picture over one half of the card, the right half unless `position` is `'left'`. The text takes the other half.
- `align`: `horizontal` moves the eyebrow, title, byline and description left, center or right. `vertical` puts them at the top under the header, in the middle, or at the bottom above the footer.

An icon or an image is `{ file }` with a path, a file URL or a package path such as `'@tabler/icons/outline/brand-github.svg'`, or `{ svg }` with the markup. Package paths resolve from your node_modules, so any icon package that ships SVG files works once installed. An image can also be a PNG, JPG or WebP. `currentColor` in an icon takes the color of the text beside it.

The style is how the card looks. Every field is optional:

```typescript
type Style = {
  theme?: Theme
  sizes?: Partial<Sizes>
  fonts?: { title?: string; body?: string; label?: string }
  background?: { pattern: 'dots' } | { image: ImageRef }
}
```

- `theme`: the colors. `dark` and `light` come from `ogier/themes`. Spread one and change a value, or give a text its own color with `title`, `description`, `aside` and the other text names.
- `sizes`: the numbers. Card size and padding, the type scale, the accent bar along the bottom edge. Every key has a default, so set only what you change. The [examples](examples) show the ones that matter in practice, and the `Sizes` type lists them all.
- `fonts`: a fontsource family per role. `title` for the title, `body` for the description, `label` for the rest. Inter and JetBrains Mono ship with ogier. Any other family needs its `@fontsource/<slug>` package installed in your project.
- `background`: `{ pattern: 'dots' }` for the dot rail on the right, or `{ image }` for a picture behind the whole card.

```typescript
import { renderPng } from 'ogier'
import { light } from 'ogier/themes'

await renderPng(card, {
  theme: { ...light, accent: '#a2e57b' },
  sizes: { titleText: 80 },
  fonts: { title: 'roboto' },
  background: { image: { file: './og-bg.png' } },
})
```

### `createRenderer(style?)`

Render many cards with one style. The fonts are read from disk once, on the first render, so a server or a build does not read them again for every card.

```typescript
import { createRenderer } from 'ogier'

const renderer = createRenderer({ theme: light, background: { pattern: 'dots' } })

for (const page of pages) {
  await writeFile(`og/${page.slug}.png`, await renderer.renderPng(page.card))
}
```

### `composeMetadata(input)` and `composeMetaTags(metadata)`

The tags that point at the image. `composeMetadata` builds the Open Graph values for one page, and `composeMetaTags` turns them into `['meta', attributes]` pairs with the Twitter tags filled in from the same values.

```typescript
import { getImageUrl, composeMetadata, composeMetaTags } from 'ogier'

const metadata = composeMetadata({
  url: 'https://feedsmith.dev/guides/parsing',
  title: 'Parsing namespaces',
  description: 'How the parser reads namespaces.',
  image: getImageUrl('https://feedsmith.dev', 'guides/parsing'),
})
const tags = composeMetaTags(metadata)
```

`getImageUrl(hostname, path, dir?)` names the image for a page: the path with slashes turned into dashes, as a PNG under `og/`.

## Adapters

### VitePress

```typescript
// docs/.vitepress/config.ts
import { dark } from 'ogier/themes'
import { vitepress } from 'ogier/adapters'
import { defineConfig } from 'vitepress'

const og = vitepress({
  site: { hostname: 'https://feedsmith.dev', favicon: { file: 'docs/public/favicon.svg' } },
  card: {
    header: { text: 'feedsmith', icon: { file: 'docs/public/favicon.svg' } },
    footer: { text: 'macieklamberski/feedsmith', icon: { file: '@tabler/icons/outline/brand-github.svg' } },
  },
  style: {
    theme: { ...dark, accent: '#ff8c4d' },
    background: { pattern: 'dots' },
  },
})

export default defineConfig({
  transformHead: og.transformHead,
  buildEnd: og.buildEnd,
})
```

Each page gets the tags from `transformHead` and a PNG under `og/` from `buildEnd`. The eyebrow is the sidebar trail to the page, the title is the page title with any `Prefix:` removed, and the home page shows the site description.

| Option | What it holds |
|---|---|
| `site` | `hostname`, plus `imageDir` for the folder under the output dir and in the image URL, default `og`, and `imageUrl`, a function from the page path to the image URL, default `getImageUrl`. `favicon` takes an SVG as `{ file }` or `{ svg }` and writes it as `favicon.png` at the output root, 192 px square unless `size` says otherwise, with an icon link on every page. Search engines take PNG favicons and not SVG ones. |
| `card` | The fields every card shares, merged over the page defaults. A function of the page data and site data gives per-page values. |
| `style` | The style passed to every render. |

### Next

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { next } from 'ogier/adapters'
import { getPost } from '../../../lib/posts'

const image = next({ background: { pattern: 'dots' } }, async ({ slug }) => {
  const post = await getPost(String(slug))

  return { header: { text: 'feedstand', aside: post.date }, title: post.title }
})

export default image.default
export const { size, contentType } = image
```

The file's default export takes the route params, resolves the card and responds with the PNG. `size` and `contentType` feed the `og:image` width, height and type. A `twitter-image.tsx` beside it re-exports the same three names. Every card in the file renders through one renderer, so the fonts are read once.
