import { describe, expect, it } from 'vitest'

import { reorderInStack } from './reorder-source'

const SAMPLE_SOURCE = `home_navbar = FoodDeliveryNavbar("PizzariaShop", ["Home"], "/", "Sign In", "Order")
home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
home_hero = FoodDeliveryHero("Craving Something Hot?", "", "Free Delivery", "On orders over $20")
home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
home_features = FoodDeliveryFeatures("Why Choose?", "desc", [])
home_features_anchor = SectionAnchor("home_features", home_features, "scroll-mt-28")
home = Stack([home_navbar_anchor, home_hero_anchor, home_features_anchor])
root = PageSwitch(["Home"], [home], "", {})`

describe('reorderInStack', () => {
  it('moves element up (swaps with predecessor)', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'up')
    expect(result.reordered).toBe(true)
    // home_hero_anchor should now be before home_navbar_anchor
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    const heroIdx = stackLine.indexOf('home_hero_anchor')
    const navbarIdx = stackLine.indexOf('home_navbar_anchor')
    expect(heroIdx).toBeLessThan(navbarIdx)
  })

  it('moves element down (swaps with successor)', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_navbar', 'down')
    expect(result.reordered).toBe(true)
    const stackLine = result.source
      .split('\n')
      .find((l) => l.includes('Stack('))!
    const heroIdx = stackLine.indexOf('home_hero_anchor')
    const navbarIdx = stackLine.indexOf('home_navbar_anchor')
    expect(heroIdx).toBeLessThan(navbarIdx)
  })

  it('already at top: returns reordered=false', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_navbar', 'up')
    expect(result.reordered).toBe(false)
  })

  it('already at bottom: returns reordered=false', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_features', 'down')
    expect(result.reordered).toBe(false)
  })

  it('variable not found: returns reordered=false', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'nonexistent', 'up')
    expect(result.reordered).toBe(false)
  })

  it('single item in stack: returns reordered=false', () => {
    const source = `home = Stack([home_hero_anchor])`
    const result = reorderInStack(source, 'home_hero', 'up')
    expect(result.reordered).toBe(false)
  })

  it('preserves rest of source (only stack line changes)', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'down')
    const originalLines = SAMPLE_SOURCE.split('\n')
    const resultLines = result.source.split('\n')
    // Only the Stack line should differ
    let diffCount = 0
    for (let i = 0; i < originalLines.length; i++) {
      if (originalLines[i] !== resultLines[i]) diffCount++
    }
    expect(diffCount).toBe(1)
  })

  it('move up then down restores original order', () => {
    const up = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'up')
    const down = reorderInStack(up.source, 'home_hero', 'down')
    expect(down.source).toBe(SAMPLE_SOURCE)
  })
})
