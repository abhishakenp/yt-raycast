import { describe, expect, it } from 'vitest'

import { THEME_PRESETS } from './theme-presets.js'

describe('public theme preset catalog', () => {
  it('exports unique theme ids with usable light and dark palettes', () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(30)

    const ids = new Set()
    for (const preset of THEME_PRESETS) {
      expect(typeof preset.id).toBe('string')
      expect(preset.id.length).toBeGreaterThan(0)
      expect(ids.has(preset.id)).toBe(false)
      ids.add(preset.id)

      expect(typeof preset.label).toBe('string')
      expect(preset.label.length).toBeGreaterThan(0)
      for (const mode of ['light', 'dark']) {
        expect(typeof preset[mode].background).toBe('string')
        expect(preset[mode].background.length).toBeGreaterThan(0)
        expect(typeof preset[mode].foreground).toBe('string')
        expect(preset[mode].foreground.length).toBeGreaterThan(0)
        expect(typeof preset[mode].primary).toBe('string')
        expect(preset[mode].primary.length).toBeGreaterThan(0)
        expect(typeof preset[mode].border).toBe('string')
        expect(preset[mode].border.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps the public catalog aligned with core generated themes users can inspect', () => {
    const ids = THEME_PRESETS.map((preset) => preset.id)

    expect(ids).toContain('modern-minimal')
    expect(ids).toContain('twitter')
    expect(ids).toContain('vercel')
    expect(ids).toContain('darkmatter')
  })
})
