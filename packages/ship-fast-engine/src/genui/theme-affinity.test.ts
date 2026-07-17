import { describe, expect, it } from 'vitest'

import { THEME_NAMES } from '../../../ship-fast-blocks/src/theme-apply.ts'
import {
  COMMERCE_FAMILIES,
  pickThemeForContext,
  resolveRetailMood,
  themePoolFor,
} from './theme-affinity.ts'
import type { RetailMood } from './theme-affinity.ts'

const ALL_MOODS: RetailMood[] = [
  'luxury',
  'street-bold',
  'organic-craft',
  'pop-retail',
  'tech-mono',
  'fresh-active',
  'retail-general',
]

const rngFrom: (values: readonly [number, ...number[]]) => () => number = (
  values,
) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe('theme mood pools', () => {
  it('every pool entry is a real theme preset', () => {
    const known = new Set(THEME_NAMES)
    for (const mood of ALL_MOODS) {
      const pool = themePoolFor(mood)
      expect(pool.length).toBeGreaterThanOrEqual(4)
      for (const name of pool) expect(known.has(name)).toBe(true)
    }
  })

  it('pools are mood-distinct (luxury pool never contains street themes)', () => {
    const luxury = new Set(themePoolFor('luxury'))
    for (const name of themePoolFor('street-bold')) {
      expect(luxury.has(name)).toBe(false)
    }
  })
})

describe('resolveRetailMood', () => {
  it('routes category keywords over family defaults', () => {
    expect(resolveRetailMood('a luxury watch atelier shop', 'Ecommerce')).toBe(
      'luxury',
    )
    expect(
      resolveRetailMood('an online sneaker drop store', 'FashionStore'),
    ).toBe('street-bold')
    expect(
      resolveRetailMood('organic skincare and candles shop', 'BeautyStore'),
    ).toBe('organic-craft')
    expect(resolveRetailMood('a kids toy store', 'Ecommerce')).toBe(
      'pop-retail',
    )
    expect(
      resolveRetailMood('headphones and audio gear store', 'ElectronicsStore'),
    ).toBe('tech-mono')
    expect(resolveRetailMood('surf and outdoor gear shop', 'Ecommerce')).toBe(
      'fresh-active',
    )
  })

  it('falls back to the family default when the brief has no category signal', () => {
    expect(resolveRetailMood('a shop for nice things', 'JewelryStore')).toBe(
      'luxury',
    )
    expect(
      resolveRetailMood('a shop for nice things', 'ElectronicsStore'),
    ).toBe('tech-mono')
    expect(resolveRetailMood('a shop for nice things', 'Ecommerce')).toBe(
      'retail-general',
    )
  })

  it('returns null for non-commerce families so callers keep full-catalog picks', () => {
    expect(resolveRetailMood('a luxury watch store', 'LawFirm')).toBeNull()
    expect(resolveRetailMood('anything', 'Marketing')).toBeNull()
  })

  it('COMMERCE_FAMILIES covers the store verticals', () => {
    for (const fam of [
      'Ecommerce',
      'FashionStore',
      'ElectronicsStore',
      'JewelryStore',
      'BeautyStore',
      'FurnitureStore',
    ]) {
      expect(COMMERCE_FAMILIES.has(fam)).toBe(true)
    }
  })
})

describe('pickThemeForContext', () => {
  it('picks inside the resolved mood pool, deterministically per rng', () => {
    const pool = themePoolFor('luxury')
    const picked = pickThemeForContext({
      prompt: 'a fine jewelry boutique',
      familyName: 'JewelryStore',
      rng: rngFrom([0.1]),
    })
    expect(picked).toBe(pool[Math.floor(0.1 * pool.length)])

    const again = pickThemeForContext({
      prompt: 'a fine jewelry boutique',
      familyName: 'JewelryStore',
      rng: rngFrom([0.1]),
    })
    expect(again).toBe(picked)
  })

  it('different seeds still vary within the pool', () => {
    const pool = themePoolFor('tech-mono')
    const a = pickThemeForContext({
      prompt: 'a store for mechanical keyboards',
      familyName: 'Ecommerce',
      rng: rngFrom([0.05]),
    })
    const b = pickThemeForContext({
      prompt: 'a store for mechanical keyboards',
      familyName: 'Ecommerce',
      rng: rngFrom([0.95]),
    })
    expect(a).not.toBe(b)
    expect(pool).toContain(a)
    expect(pool).toContain(b)
  })

  it('returns null for non-commerce context', () => {
    expect(
      pickThemeForContext({
        prompt: 'a dental clinic website',
        familyName: 'Dental',
        rng: rngFrom([0.5]),
      }),
    ).toBeNull()
  })
})
