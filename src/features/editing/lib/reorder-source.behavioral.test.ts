// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { reorderInStack } from './reorder-source'

/**
 * Behavioral regression tests for the "move element up/down" feature.
 *
 * Two production bugs are documented here:
 *
 * BUG 1 (Dashboard.tsx handleMoveUp/handleMoveDown): the handlers read
 *   `el.getAttribute('id')` to derive the section variable name, but the
 *   OpenUI runtime stamps `data-openui-var` on rendered elements (not `id`).
 *   The `id` attribute frequently does NOT match the source variable name, so
 *   reorder.reorder() is called with the wrong identifier and the move is a
 *   no-op. The handlers should prefer `data-openui-var` over `id`.
 *
 * BUG 2 (reorder-source.ts lines 82-91): the swap uses a fragile ASI pattern
 *   (`if (...) return ... \n ;[a, b] = [b, a]`). This looks like it could fail
 *   to execute the swap, but ASI after a `return` restricted production
 *   correctly terminates the if-statement, so the swap DOES run when idx > 0.
 *   Tests 1-7 guard against any future regression that breaks this.
 */

const SAMPLE_SOURCE = `home_navbar = FoodDeliveryNavbar("PizzariaShop", ["Home"], "/", "Sign In", "Order")
home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
home_hero = FoodDeliveryHero("Craving Something Hot?", "", "Free Delivery", "On orders over $20")
home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
home_features = FoodDeliveryFeatures("Why Choose?", "desc", [])
home_features_anchor = SectionAnchor("home_features", home_features, "scroll-mt-28")
home = Stack([home_navbar_anchor, home_hero_anchor, home_features_anchor])
root = PageSwitch(["Home"], [home], "", {})`

const stackLine = (src: string): string =>
  src.split('\n').find((l) => l.includes('Stack('))!

const indexOf = (src: string, item: string): number =>
  stackLine(src).indexOf(item)

// ---------------------------------------------------------------------------
// PART A — reorderInStack correctness
// ---------------------------------------------------------------------------

describe('reorderInStack — correctness', () => {
  it('moves element up: swaps with predecessor', () => {
    // 3-item stack: [navbar, hero, features]; move middle (hero) up.
    const result = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'up')
    expect(result.reordered).toBe(true)
    // hero should now come before navbar in the Stack line
    expect(indexOf(result.source, 'home_hero_anchor')).toBeLessThan(
      indexOf(result.source, 'home_navbar_anchor'),
    )
  })

  it('moves element down: swaps with successor', () => {
    // 3-item stack: [navbar, hero, features]; move middle (hero) down.
    const result = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'down')
    expect(result.reordered).toBe(true)
    // hero should now come after features in the Stack line
    expect(indexOf(result.source, 'home_features_anchor')).toBeLessThan(
      indexOf(result.source, 'home_hero_anchor'),
    )
  })

  it('move up at top: returns reordered=false', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_navbar', 'up')
    expect(result.reordered).toBe(false)
    expect(result.source).toBe(SAMPLE_SOURCE)
  })

  it('move down at bottom: returns reordered=false', () => {
    const result = reorderInStack(SAMPLE_SOURCE, 'home_features', 'down')
    expect(result.reordered).toBe(false)
    expect(result.source).toBe(SAMPLE_SOURCE)
  })

  it('move up then down restores original', () => {
    const up = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'up')
    expect(up.reordered).toBe(true)
    const down = reorderInStack(up.source, 'home_hero', 'down')
    expect(down.reordered).toBe(true)
    expect(down.source).toBe(SAMPLE_SOURCE)
  })

  it('move down then up restores original', () => {
    const down = reorderInStack(SAMPLE_SOURCE, 'home_hero', 'down')
    expect(down.reordered).toBe(true)
    const up = reorderInStack(down.source, 'home_hero', 'up')
    expect(up.reordered).toBe(true)
    expect(up.source).toBe(SAMPLE_SOURCE)
  })

  it('source unchanged when reorder fails', () => {
    // At-top move up is a no-op; source must be byte-identical (===).
    const result = reorderInStack(SAMPLE_SOURCE, 'home_navbar', 'up')
    expect(result.reordered).toBe(false)
    expect(result.source === SAMPLE_SOURCE).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// PART B — data-openui-var DOM lookup (what Dashboard handlers SHOULD do)
// ---------------------------------------------------------------------------

/**
 * The correct var-name resolution the Dashboard handlers should use.
 * Today they only do `el.getAttribute('id') || el.closest('[id]')?.getAttribute('id')`,
 * which misses `data-openui-var` entirely (BUG 1).
 */
const resolveVarName = (el: HTMLElement): string | undefined =>
  el.getAttribute('data-openui-var') ??
  el.closest('[data-openui-var]')?.getAttribute('data-openui-var') ??
  el.getAttribute('id') ??
  el.closest('[id]')?.getAttribute('id') ??
  undefined

describe('resolveVarName — data-openui-var DOM lookup', () => {
  it('reads data-openui-var from element itself', () => {
    const el = document.createElement('div')
    el.setAttribute('data-openui-var', 'home_hero')
    expect(resolveVarName(el)).toBe('home_hero')
  })

  it('reads data-openui-var from nearest ancestor', () => {
    const parent = document.createElement('section')
    parent.setAttribute('data-openui-var', 'home_features')
    const child = document.createElement('div')
    parent.appendChild(child)
    expect(resolveVarName(child)).toBe('home_features')
  })

  it('prefers data-openui-var over id', () => {
    const el = document.createElement('div')
    el.setAttribute('id', 'some-dom-id')
    el.setAttribute('data-openui-var', 'home_hero')
    expect(resolveVarName(el)).toBe('home_hero')
  })

  it('falls back to id when data-openui-var absent', () => {
    const el = document.createElement('div')
    el.setAttribute('id', 'home_hero')
    expect(resolveVarName(el)).toBe('home_hero')
  })

  it('returns undefined when neither present', () => {
    const el = document.createElement('div')
    expect(resolveVarName(el)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// PART C — edge-case regression guards
// ---------------------------------------------------------------------------

describe('reorderInStack — edge cases', () => {
  it('multi-line Stack array returns reordered=false (regex is single-line only)', () => {
    // The Stack array is split across multiple lines; the per-line regex
    // cannot match the full Stack([...]) pattern, so reorder is a graceful
    // no-op (reordered=false), not a crash.
    const multiLineSource = `a_anchor = SectionAnchor("a", a)
b_anchor = SectionAnchor("b", b)
home = Stack([
  a_anchor,
  b_anchor,
])
root = PageSwitch(["Home"], [home], "", {})`
    const result = reorderInStack(multiLineSource, 'a', 'down')
    expect(result.reordered).toBe(false)
    expect(result.source).toBe(multiLineSource)
  })

  it('Stack with 2 items: move first down works', () => {
    const source = `a_anchor = SectionAnchor("a", a)
b_anchor = SectionAnchor("b", b)
home = Stack([a_anchor, b_anchor])`
    const result = reorderInStack(source, 'a', 'down')
    expect(result.reordered).toBe(true)
    const line = stackLine(result.source)
    // b_anchor should now come before a_anchor
    expect(line.indexOf('b_anchor')).toBeLessThan(line.indexOf('a_anchor'))
  })

  it('Stack with 2 items: move second up works', () => {
    const source = `a_anchor = SectionAnchor("a", a)
b_anchor = SectionAnchor("b", b)
home = Stack([a_anchor, b_anchor])`
    const result = reorderInStack(source, 'b', 'up')
    expect(result.reordered).toBe(true)
    const line = stackLine(result.source)
    // b_anchor should now come before a_anchor
    expect(line.indexOf('b_anchor')).toBeLessThan(line.indexOf('a_anchor'))
  })

  it('PageSwitch reorder works: move second page up', () => {
    // Two pages in the PageSwitch second array; move the second one ("about")
    // up so it swaps with "home".
    const source = `home = Stack([home_hero_anchor])
about = Stack([about_hero_anchor])
root = PageSwitch(["Home", "About"], [home, about], "", {})`
    const result = reorderInStack(source, 'about', 'up')
    expect(result.reordered).toBe(true)
    const pageLine = result.source
      .split('\n')
      .find((l) => l.includes('PageSwitch('))!
    // about should now come before home in the second array
    const secondArrayStart = pageLine.indexOf(']', pageLine.indexOf('[')) + 1
    const secondArray = pageLine.slice(secondArrayStart)
    expect(secondArray.indexOf('about')).toBeLessThan(
      secondArray.indexOf('home'),
    )
  })

  it('PageSwitch with single page: move up returns reordered=false', () => {
    const source = `home = Stack([home_hero_anchor])
root = PageSwitch(["Home"], [home], "", {})`
    const result = reorderInStack(source, 'home', 'up')
    expect(result.reordered).toBe(false)
  })
})
