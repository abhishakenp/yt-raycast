import { describe, expect, it } from 'vitest'

import {
  deriveCustomPalette,
  hexToHsl,
  hslToHex,
  luminance,
} from './palette-derive.js'

describe('public palette derivation helper', () => {
  it('normalizes shorthand and uppercase seed colors into a custom palette', () => {
    const palette = deriveCustomPalette(' #ABC ')

    expect(palette).toMatchObject({
      id: 'custom',
      name: 'Custom',
      seedHex: '#aabbcc',
      accent: '#aabbcc',
    })
    expect(palette.dark.primary).toBe('#aabbcc')
    expect(palette.light.primary).toBe('#aabbcc')
    expect(palette.dark.background).toMatch(/^#[0-9a-f]{6}$/)
    expect(palette.light.background).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('falls back to the default seed for invalid colors', () => {
    expect(deriveCustomPalette('not-a-color').seedHex).toBe('#3b82f6')
    expect(deriveCustomPalette(null).seedHex).toBe('#3b82f6')
  })

  it('round-trips basic HSL and luminance calculations used by generated themes', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000')
    expect(hslToHex(120, 100, 50)).toBe('#00ff00')
    expect(hexToHsl('#000000')).toMatchObject({ h: 0, s: 0, l: 0 })
    expect(luminance('#ffffff')).toBeCloseTo(1, 5)
    expect(luminance('#000000')).toBeCloseTo(0, 5)
  })
})
