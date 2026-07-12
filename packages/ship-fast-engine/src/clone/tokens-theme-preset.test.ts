import { describe, expect, it } from 'vitest'
import { tokensToThemePreset } from './tokens.ts'
import type { ExtractedTokens } from './types.ts'

// Theme system applies kebab-case, unprefixed keys (see THEME_VAR_KEYS in
// ship-fast-blocks/src/theme-apply.ts). These tests assert the derived preset
// carries the source's look on those exact keys so a cloned site's DEFAULT theme
// matches the scraped page.

function baseTokens(overrides: Partial<ExtractedTokens> = {}): ExtractedTokens {
  return {
    background: '#ffffff',
    foreground: '#111111',
    primary: '#0792d0',
    secondary: '#f1f5f9',
    muted: '#f3f4f6',
    accent: '#640032',
    border: '#e5e7eb',
    radius: '6px',
    fontFamily: 'Open Sans',
    spacing: '1rem',
    ...overrides,
  }
}

describe('tokensToThemePreset', () => {
  it('returns light + dark maps that carry the source palette/fonts/radius on theme keys', () => {
    const t = baseTokens()
    const preset = tokensToThemePreset(t)

    expect(preset).toHaveProperty('light')
    expect(preset).toHaveProperty('dark')

    // Light mirrors the extracted tokens on the exact applied keys.
    expect(preset.light.background).toBe(t.background)
    expect(preset.light.foreground).toBe(t.foreground)
    expect(preset.light.primary).toBe(t.primary)
    expect(preset.light.accent).toBe(t.accent)
    expect(preset.light.secondary).toBe(t.secondary)
    expect(preset.light.muted).toBe(t.muted)
    expect(preset.light.border).toBe(t.border)
    expect(preset.light.input).toBe(t.border)
    expect(preset.light.ring).toBe(t.primary)
    expect(preset.light.radius).toBe(t.radius)
    // Key naming is kebab-case 'font-sans', not 'fontSans'.
    expect(preset.light['font-sans']).toBe(t.fontFamily)
    // Card/popover mirror the page surface.
    expect(preset.light.card).toBe(t.background)
    expect(preset.light['card-foreground']).toBe(t.foreground)
    expect(preset.light.popover).toBe(t.background)
    expect(preset.light['popover-foreground']).toBe(t.foreground)
  })

  it('sets a readable primary-foreground (contrast) against the primary', () => {
    const t = baseTokens()
    const { light } = tokensToThemePreset(t)
    // primary #0792d0 is a saturated blue (dark-ish) -> light foreground.
    expect(light['primary-foreground']).toBeTruthy()
    expect(/^#[0-9a-f]{6}$/i.test(light['primary-foreground'])).toBe(true)
    expect(light['primary-foreground']).not.toBe(t.primary)

    // A bright/yellow primary must get a dark foreground for legibility.
    const bright = tokensToThemePreset(baseTokens({ primary: '#ffe600' }))
    expect(bright.light['primary-foreground']).toBe('#0a0a0a')
  })

  it('derives a dark variant with a dark background and a light foreground', () => {
    const { dark } = tokensToThemePreset(baseTokens())
    expect(/^#[0-9a-f]{6}$/i.test(dark.background)).toBe(true)
    // Dark bg must be dark, fg must be light.
    const lum = (hex) => {
      const m = hex.match(/^#([0-9a-f]{6})$/i)!
      const r = parseInt(m[1].slice(0, 2), 16)
      const g = parseInt(m[1].slice(2, 4), 16)
      const b = parseInt(m[1].slice(4, 6), 16)
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    }
    expect(lum(dark.background)).toBeLessThan(0.5)
    expect(lum(dark.foreground)).toBeGreaterThan(0.5)
    // Brand primary/accent + radius/font are preserved into dark.
    expect(dark.primary).toBe('#0792d0')
    expect(dark.accent).toBe('#640032')
    expect(dark.radius).toBe('6px')
    expect(dark['font-sans']).toBe('Open Sans')
  })

  it("preserves an already-dark source's background in the dark variant", () => {
    const { dark } = tokensToThemePreset(
      baseTokens({ background: '#0b0b0f', foreground: '#eaeaea' }),
    )
    expect(dark.background).toBe('#0b0b0f')
  })

  it('falls back to sane defaults for empty/invalid tokens', () => {
    const { light, dark } = tokensToThemePreset(
      baseTokens({
        background: '',
        foreground: 'transparent',
        primary: '',
        accent: 'not-a-color',
        radius: '',
        fontFamily: '',
      }),
    )
    expect(light.background).toBe('#ffffff')
    expect(light.foreground).toBe('#0a0a0a')
    expect(light.primary).toBe('#3b82f6')
    // accent falls back to primary when its own value is unusable.
    expect(light.accent).toBe('#3b82f6')
    expect(light.radius).toBe('0.5rem')
    expect(light['font-sans']).toBe('sans-serif')
    expect(/^#[0-9a-f]{6}$/i.test(dark.background)).toBe(true)
  })
})
