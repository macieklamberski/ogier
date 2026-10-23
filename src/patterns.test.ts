import { describe, expect, it } from 'bun:test'
import { defaultSizes } from './layout.js'
import { type Pattern, renderPattern } from './patterns.js'
import { dark } from './themes/dark.js'

const tileCases: Array<[Pattern, string, number]> = [
  ['dots', '<circle cx="12" cy="12" r="2" fill="#5c5c5c" />', 0],
  ['stripes', '<line x1="0" y1="0" x2="0" y2="24" stroke="#5c5c5c" stroke-width="1" />', 45],
  ['grid', '<path d="M0 0V24M0 0H24" fill="none" stroke="#5c5c5c" stroke-width="1" />', 0],
  ['crosses', '<path d="M12 6V18M6 12H18" fill="none" stroke="#5c5c5c" stroke-width="1" />', 0],
  ['waves', '<path d="M0 12Q12 4 24 12T48 12" fill="none" stroke="#5c5c5c" stroke-width="1" />', 0],
  ['checks', '<path d="M0 0H12V12H0ZM12 12H24V24H12Z" fill="#5c5c5c" />', 0],
]

describe('renderPattern', () => {
  it.each(tileCases)('should draw the %s tile at its default angle', (pattern, tile, angle) => {
    const result = renderPattern({ pattern }, defaultSizes, dark)

    expect(result).toContain(tile)
    expect(result).toContain(`patternTransform="rotate(${angle})"`)
  })

  it('should give the wave a tile two steps wide', () => {
    const result = renderPattern({ pattern: 'waves' }, defaultSizes, dark)

    expect(result).toContain('<pattern id="tile" width="48" height="24"')
  })

  it('should size the rail from the sizes table and fade it in', () => {
    const sizes = { ...defaultSizes, cardHeight: 400, railWidth: 300, railStep: 10 }
    const result = renderPattern({ pattern: 'dots' }, sizes, dark)
    const expected = [
      'viewBox="0 0 300 400" width="300" height="400"',
      '<pattern id="tile" width="10" height="10"',
      'mask="url(#mask)"',
    ]

    for (const part of expected) {
      expect(result).toContain(part)
    }
  })

  it('should take an angle and drop the fade when asked', () => {
    const result = renderPattern({ pattern: 'stripes', angle: 90, fade: false }, defaultSizes, dark)

    expect(result).toContain('patternTransform="rotate(90)"')
    expect(result).not.toContain('mask')
  })
})
