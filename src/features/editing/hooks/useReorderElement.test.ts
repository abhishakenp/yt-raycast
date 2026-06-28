// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { reorderInStack } from '../lib/reorder-source'

// Test the pure function that the hook uses — the hook itself is a thin
// wrapper around convex mutations which can't be tested in isolation
// without mocking the entire convex client.

describe('useReorderElement (via reorderInStack)', () => {
  const SOURCE = `home_hero = FoodDeliveryHero("title")
home_hero_anchor = SectionAnchor("home_hero", home_hero)
home_features = FoodDeliveryFeatures("title2")
home_features_anchor = SectionAnchor("home_features", home_features)
home = Stack([home_hero_anchor, home_features_anchor])`

  it('reorder up swaps with predecessor', () => {
    const result = reorderInStack(SOURCE, 'home_features', 'up')
    expect(result.reordered).toBe(true)
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    expect(stackLine.indexOf('home_features_anchor')).toBeLessThan(
      stackLine.indexOf('home_hero_anchor'),
    )
  })

  it('reorder down swaps with successor', () => {
    const result = reorderInStack(SOURCE, 'home_hero', 'down')
    expect(result.reordered).toBe(true)
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    expect(stackLine.indexOf('home_features_anchor')).toBeLessThan(
      stackLine.indexOf('home_hero_anchor'),
    )
  })

  it('reorder up at top returns false', () => {
    const result = reorderInStack(SOURCE, 'home_hero', 'up')
    expect(result.reordered).toBe(false)
  })

  it('reorder down at bottom returns false', () => {
    const result = reorderInStack(SOURCE, 'home_features', 'down')
    expect(result.reordered).toBe(false)
  })

  it('reorder non-existent var returns false', () => {
    const result = reorderInStack(SOURCE, 'nonexistent', 'up')
    expect(result.reordered).toBe(false)
  })
})
