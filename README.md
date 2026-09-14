# Ogier

[![codecov](https://codecov.io/gh/macieklamberski/ogier/branch/main/graph/badge.svg)](https://codecov.io/gh/macieklamberski/ogier)
[![npm version](https://img.shields.io/npm/v/ogier.svg)](https://www.npmjs.com/package/ogier)
[![license](https://img.shields.io/npm/l/ogier.svg)](https://github.com/macieklamberski/ogier/blob/main/LICENSE)

Generate Open Graph images and meta tags for any page. Titles, sections and branding in, a themed PNG and a tag list out.

A share card is rendered from a plain card object through a layout, a theme and a size table. Satori turns the layout into SVG and resvg turns that into a 1200 by 630 PNG. Fonts come from fontsource packages, icons from Tabler or your own SVG files. A VitePress adapter renders one card per page at build time and emits the tags that point at it.

## Installation

```bash
npm install ogier
```

Tabler icons are optional. Install `@tabler/icons` to use an icon by name.

## Quick Start

```typescript
import { writeFile } from 'node:fs/promises'
import { renderPng } from 'ogier'

const png = await renderPng(
  {
    name: 'feedsmith',
    eyebrow: 'Guides › Parsing',
    title: 'Parsing namespaces',
    footer: 'macieklamberski/feedsmith',
  },
  {
    logo: { file: './public/favicon.svg' },
    footerIcon: 'brand-github',
  },
)

await writeFile('og/guides-parsing.png', png)
```

## API

### `renderPng(card, options?)` and `renderSvg(card, options?)`

Render one card. Both take the same arguments and return a PNG buffer or an SVG string.

A card holds text only. It needs a title, a description or both. A description alone takes the title's place, which is what a home page card usually wants.

```typescript
type Card = {
  name: string
  eyebrow?: string
  title?: string
  description?: string
  footer?: string
}
```

Options hold the site-level setup. Every field is optional.

| Option | Default | What it does |
|---|---|---|
| `layout` | `'docs'` | The built-in layout by name, or a custom `Layout` object. |
| `theme` | `darkTheme` | Colors: `bg`, `text`, `textMuted`, `accent`, `pattern`. Spread a preset to override one value. |
| `sizes` | the layout's table | Size overrides, merged over the layout's defaults. `cardWidth` and `cardHeight` set the image size. |
| `fonts` | `{ title: 'inter', label: 'jetbrains-mono' }` | A fontsource slug per role. Inter and JetBrains Mono ship with ogier. Any other family needs its `@fontsource/<slug>` package installed. |
| `logo` | none | The mark beside the name. |
| `footerIcon` | none | The mark beside the footer text. |
| `background` | none | `{ pattern: 'dots' }` for the dot rail, or `{ image }` for a full-bleed image. |

An icon is a Tabler name such as `'brand-github'`, `{ file }` with a path or file URL, or `{ svg }` with the markup as a string or bytes. Tabler icons render inline and take the surrounding text color. Files and markup embed as images with their own colors.

```typescript
import { darkTheme, renderPng } from 'ogier'

await renderPng(card, {
  theme: { ...darkTheme, accent: '#a2e57b' },
  sizes: { titleText: 80 },
  fonts: { title: 'roboto' },
  logo: { svg: markup },
  background: { image: { file: './og-bg.png' } },
})
```

### `getMetadata(input)` and `toMetaTags(metadata)`

`getMetadata` builds the Open Graph values for one page. `toMetaTags` turns them into `['meta', attributes]` pairs, with the title, description and image mirrored into the Twitter tags.

```typescript
import { getImageUrl, getMetadata, toMetaTags } from 'ogier'

const metadata = getMetadata({
  url: 'https://feedsmith.dev/guides/parsing',
  title: 'Parsing namespaces',
  description: 'How the parser reads namespaces.',
  image: getImageUrl('https://feedsmith.dev', 'guides/parsing'),
})

const tags = toMetaTags(metadata)
```

`getImageUrl(hostname, path, dir?)` is the default image scheme: the page path with slashes turned into dashes, as a PNG under `og/`.

## VitePress

```typescript
// docs/.vitepress/config.ts
import { darkTheme } from 'ogier'
import { vitepress } from 'ogier/vitepress'
import { defineConfig } from 'vitepress'

const og = vitepress({
  hostname: 'https://feedsmith.dev',
  name: 'feedsmith',
  logo: { file: 'docs/public/favicon.svg' },
  footer: { icon: 'brand-github', text: 'macieklamberski/feedsmith' },
  background: { pattern: 'dots' },
  theme: { ...darkTheme, accent: '#ff8c4d' },
})

export default defineConfig({
  transformHead: og.transformHead,
  buildEnd: og.buildEnd,
})
```

Each page gets the tags from `transformHead` and a PNG under `og/` from `buildEnd`. The eyebrow is the sidebar trail to the page, the title is the page title with any `Prefix:` removed, and the home page shows the site description. The adapter takes every render option plus:

| Option | Default | What it does |
|---|---|---|
| `imageDir` | `'og'` | The folder under the output dir and in the image URL. |
| `imageUrl` | `getImageUrl` | A function from the page path to the image URL. |
| `card` | none | A function from the page data and site data to card fields, merged over the defaults. |
