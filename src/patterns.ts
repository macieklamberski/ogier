import type { Background, Sizes, Theme } from './types/index.js'

export type Pattern = 'dots' | 'stripes' | 'grid' | 'crosses' | 'waves' | 'checks'

type Tile = (sizes: Sizes, color: string) => { width: number; height: number; markup: string }

const defaultAngles: Record<Pattern, number> = {
  dots: 0,
  stripes: 45,
  grid: 0,
  crosses: 0,
  waves: 0,
  checks: 0,
}

// Each tile is railStep square, except the wave, which is two steps wide for a long, shallow
// swell, and repeats in both directions.
const tiles: Record<Pattern, Tile> = {
  dots: ({ railStep, railDotRadius }, color) => {
    const markup = `<circle cx="${railStep / 2}" cy="${railStep / 2}" r="${railDotRadius}" fill="${color}" />`

    return { width: railStep, height: railStep, markup }
  },
  stripes: ({ railStep, railStrokeWidth }, color) => {
    const markup = `<line x1="0" y1="0" x2="0" y2="${railStep}" stroke="${color}" stroke-width="${railStrokeWidth}" />`

    return { width: railStep, height: railStep, markup }
  },
  grid: ({ railStep, railStrokeWidth }, color) => {
    const markup = `<path d="M0 0V${railStep}M0 0H${railStep}" fill="none" stroke="${color}" stroke-width="${railStrokeWidth}" />`

    return { width: railStep, height: railStep, markup }
  },
  crosses: ({ railStep, railStrokeWidth }, color) => {
    const center = railStep / 2
    const arm = railStep / 4
    const markup = `<path d="M${center} ${center - arm}V${center + arm}M${center - arm} ${center}H${center + arm}" fill="none" stroke="${color}" stroke-width="${railStrokeWidth}" />`

    return { width: railStep, height: railStep, markup }
  },
  waves: ({ railStep, railStrokeWidth }, color) => {
    const width = railStep * 2
    const middle = railStep / 2
    const crest = railStep / 3
    const markup = `<path d="M0 ${middle}Q${width / 4} ${middle - crest} ${width / 2} ${middle}T${width} ${middle}" fill="none" stroke="${color}" stroke-width="${railStrokeWidth}" />`

    return { width, height: railStep, markup }
  },
  checks: ({ railStep }, color) => {
    const half = railStep / 2
    const markup = `<path d="M0 0H${half}V${half}H0ZM${half} ${half}H${railStep}V${railStep}H${half}Z" fill="${color}" />`

    return { width: railStep, height: railStep, markup }
  },
}

// The rail is railWidth by cardHeight, pinned to the right edge, and the fade runs from clear
// on its left edge to full on the right, so the pattern rises behind the text without touching it.
export const renderPattern = (
  background: Extract<Background, { pattern: Pattern }>,
  sizes: Sizes,
  theme: Theme,
): string => {
  const { pattern, angle = defaultAngles[pattern], fade = true } = background
  const { railWidth, cardHeight } = sizes
  const tile = tiles[pattern](sizes, theme.pattern)
  const maskAttribute = fade ? ' mask="url(#mask)"' : ''
  const mask = fade
    ? `
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" />
          <stop offset="1" stop-color="#fff" />
        </linearGradient>
        <mask id="mask">
          <rect width="${railWidth}" height="${cardHeight}" fill="url(#fade)" />
        </mask>`
    : ''

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${railWidth} ${cardHeight}" width="${railWidth}" height="${cardHeight}">
      <defs>
        <pattern id="tile" width="${tile.width}" height="${tile.height}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
          ${tile.markup}
        </pattern>${mask}
      </defs>
      <rect width="${railWidth}" height="${cardHeight}" fill="url(#tile)"${maskAttribute} />
    </svg>
  `
}
