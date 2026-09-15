# Ogier

[![codecov](https://codecov.io/gh/macieklamberski/ogier/branch/main/graph/badge.svg)](https://codecov.io/gh/macieklamberski/ogier)
[![npm version](https://img.shields.io/npm/v/ogier.svg)](https://www.npmjs.com/package/ogier)
[![license](https://img.shields.io/npm/l/ogier.svg)](https://github.com/macieklamberski/ogier/blob/main/LICENSE)

Generate Open Graph images and meta tags for any page. Titles, sections and branding in, a themed PNG and a tag list out.

A share card is rendered from a plain card object through a layout, a theme and a size table. Satori turns the layout into SVG and resvg turns that into a 1200 by 630 PNG. Fonts come from fontsource packages, icons from any SVG file, your own or one shipped by an icon package (Tabler, Lucide). A VitePress adapter renders one card per page at build time and emits the tags that point at it.

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

## API

### `renderPng(card, style?)` and `renderSvg(card, style?)`

Render one card. Both take the same arguments and return a PNG buffer or an SVG string.

A card is what the image says and shows. It needs a title, a description or both. A description alone takes the title's place, which is what a home page card usually wants. The header and the footer are a text with an optional icon.

```typescript
type Card = {
  header?: { text: string; icon?: IconRef }
  eyebrow?: string
  title?: string
  description?: string
  footer?: { text: string; icon?: IconRef }
}
```

An icon is `{ file }` with a path, a file URL or a package path such as `'@tabler/icons/outline/brand-github.svg'` or `'lucide-static/icons/rss.svg'`, or `{ svg }` with the markup as a string or bytes. A package path resolves from your node_modules, so any icon package that ships SVG files works once installed. `currentColor` in the SVG takes the color of the text beside it, or the icon's own `color` when given, and baked colors stay as they are.

Style is how the card is drawn. Every field is optional.

| Option | Default | What it does |
|---|---|---|
| `layout` | `'docs'` | The built-in layout by name, or a custom `Layout` object. |
| `theme` | `darkTheme` | Colors: `bg`, `text`, `textMuted`, `accent`, `pattern`. Spread a preset to override one value. |
| `sizes` | the layout's table | Size overrides, merged over the layout's defaults. `cardWidth` and `cardHeight` set the image size. |
| `fonts` | `{ title: 'inter', label: 'jetbrains-mono' }` | A fontsource slug per role. Inter and JetBrains Mono ship with ogier. Any other family needs its `@fontsource/<slug>` package installed. |
| `background` | none | `{ pattern: 'dots' }` for the dot rail, or `{ image }` for a full-bleed image. |

```typescript
import { darkTheme, renderPng } from 'ogier'

await renderPng(card, {
  theme: { ...darkTheme, accent: '#a2e57b' },
  sizes: { titleText: 80 },
  fonts: { title: 'roboto' },
  background: { image: { file: './og-bg.png' } },
})
```

### `composeMetadata(input)` and `composeMetaTags(metadata)`

`composeMetadata` builds the Open Graph values for one page. `composeMetaTags` turns them into `['meta', attributes]` pairs, with the title, description and image mirrored into the Twitter tags.

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

`getImageUrl(hostname, path, dir?)` is the default image scheme: the page path with slashes turned into dashes, as a PNG under `og/`.

## Adapters

### VitePress

```typescript
// docs/.vitepress/config.ts
import { darkTheme } from 'ogier'
import { vitepress } from 'ogier/vitepress'
import { defineConfig } from 'vitepress'

const og = vitepress({
  site: { hostname: 'https://feedsmith.dev' },
  card: {
    header: { text: 'feedsmith', icon: { file: 'docs/public/favicon.svg' } },
    footer: { text: 'macieklamberski/feedsmith', icon: { file: '@tabler/icons/outline/brand-github.svg' } },
  },
  style: {
    theme: { ...darkTheme, accent: '#ff8c4d' },
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
| `site` | `hostname`, plus `imageDir` for the folder under the output dir and in the image URL, default `og`, and `imageUrl`, a function from the page path to the image URL, default `getImageUrl`. |
| `card` | The fields every card shares, merged over the page defaults. A function of the page data and site data gives per-page values. |
| `style` | The style passed to every render. |
