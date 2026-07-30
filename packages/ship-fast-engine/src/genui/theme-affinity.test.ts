import { describe, expect, it } from 'vitest'

import { THEME_NAMES } from '../../../ship-fast-blocks/src/theme-apply.ts'
import { DEFAULT_DESIGN } from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import type { DesignIntent } from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import { pickThemeForDesignIntent } from './theme-affinity.ts'

const rngFrom: (values: readonly [number, ...number[]]) => () => number = (
  values,
) => {
  let i = 0
  return () => values[i++ % values.length]
}

const knownThemes = new Set(THEME_NAMES)

describe('pickThemeForDesignIntent', () => {
  it('always returns a known theme preset', () => {
    const designs: DesignIntent[] = [
      {
        ...DEFAULT_DESIGN,
        shadow: 'shadow-[8px_8px_0_0]',
        radius: 'rounded-none',
        typography: 'technical',
      },
      { ...DEFAULT_DESIGN, typography: 'editorial', radius: 'rounded-xl' },
      { ...DEFAULT_DESIGN, typography: 'technical' },
      { ...DEFAULT_DESIGN, typography: 'display', gradient: 'vibrant' },
      { ...DEFAULT_DESIGN, typography: 'humanist', radius: 'rounded-xl' },
      { ...DEFAULT_DESIGN, gradient: 'subtle', typography: 'humanist' },
      { ...DEFAULT_DESIGN, radius: 'rounded-full' },
      { ...DEFAULT_DESIGN, gradient: 'mesh' },
      DEFAULT_DESIGN,
    ]
    for (const design of designs) {
      const theme = pickThemeForDesignIntent(design, rngFrom([0.5]))
      expect(knownThemes.has(theme)).toBe(true)
    }
  })

  it('picks deterministically for same rng', () => {
    const design: DesignIntent = { ...DEFAULT_DESIGN, typography: 'editorial' }
    const a = pickThemeForDesignIntent(design, rngFrom([0.3]))
    const b = pickThemeForDesignIntent(design, rngFrom([0.3]))
    expect(a).toBe(b)
  })

  it('different rng values produce different themes within a pool', () => {
    const design: DesignIntent = {
      ...DEFAULT_DESIGN,
      typography: 'editorial',
      radius: 'rounded-xl',
    }
    const a = pickThemeForDesignIntent(design, rngFrom([0.05]))
    const b = pickThemeForDesignIntent(design, rngFrom([0.95]))
    expect(a).not.toBe(b)
  })

  it('brutalist design picks from brutalist pool', () => {
    const brutalistPool = [
      'neo-brutalism',
      'doom-64',
      'mono',
      'bold-tech',
      'cyberpunk',
    ]
    const design: DesignIntent = { ...DEFAULT_DESIGN, shadow: 'shadow-[8px_8px_0_0]' }
    // Try multiple rng values — all should land in the brutalist pool
    for (const v of [0.0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
      const theme = pickThemeForDesignIntent(design, rngFrom([v]))
      expect(brutalistPool).toContain(theme)
    }
  })

  it('technical design picks from tech pool', () => {
    const techPool = [
      'vercel',
      'darkmatter',
      'graphite',
      'perpetuity',
      'clean-slate',
      'supabase',
    ]
    const design: DesignIntent = { ...DEFAULT_DESIGN, typography: 'technical', shadow: 'shadow-sm' }
    for (const v of [0.0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
      const theme = pickThemeForDesignIntent(design, rngFrom([v]))
      expect(techPool).toContain(theme)
    }
  })

  it('editorial design picks from elegant pool', () => {
    const elegantPool = [
      'elegant-luxury',
      'starry-night',
      'midnight-bloom',
      'vintage-paper',
      'claude',
      'sage-garden',
    ]
    const design: DesignIntent = {
      ...DEFAULT_DESIGN,
      typography: 'editorial',
      radius: 'rounded-xl',
      shadow: 'shadow-sm',
    }
    for (const v of [0.0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
      const theme = pickThemeForDesignIntent(design, rngFrom([v]))
      expect(elegantPool).toContain(theme)
    }
  })
})
