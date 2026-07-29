import { describe, expect, it } from 'vitest'

import {
  parseRouteTarget,
  resolveRouteHref,
  resolveRouteTarget,
} from './route-context.tsx'

describe('route target resolution', () => {
  it('parses page and section targets', () => {
    expect(parseRouteTarget('Pricing')).toEqual({
      page: 'Pricing',
      type: 'page',
    })
    expect(parseRouteTarget('Pricing#pricing_faq')).toEqual({
      page: 'Pricing',
      sectionId: 'pricing_faq',
      type: 'section',
    })
    expect(parseRouteTarget('#home_features')).toEqual({
      page: '',
      sectionId: 'home_features',
      type: 'section',
    })
    expect(parseRouteTarget('')).toBeNull()
  })

  it('resolves exact route names (case-insensitive)', () => {
    const routes = ['Home', 'Pricing']

    expect(resolveRouteTarget('Pricing', routes)).toEqual({
      page: 'Pricing',
      type: 'page',
    })
    expect(resolveRouteTarget('pricing', routes)).toEqual({
      page: 'Pricing',
      type: 'page',
    })
    expect(resolveRouteTarget('HOME', routes)).toEqual({
      page: 'Home',
      type: 'page',
    })
  })

  it('returns null for labels that are not exact routes (no semantic guessing)', () => {
    const routes = ['Home', 'Plans', 'Contact']

    // "Upgrade now" is not an exact route → null (falls back to hash)
    expect(resolveRouteTarget('Upgrade now', routes)).toBe(null)
    // "Book demo" is not an exact route → null
    expect(resolveRouteTarget('Book demo', routes)).toBe(null)
    // "Get Started" is not an exact route → null
    expect(resolveRouteTarget('Get Started', routes)).toBe(null)
  })

  it('keeps unresolved targets on single-page sites on the single route', () => {
    expect(resolveRouteTarget('Definitely missing', ['Home'])).toEqual({
      page: 'Home',
      type: 'page',
    })
    expect(resolveRouteHref('Missing', ['Home'])).toBe('/')
    expect(
      resolveRouteHref('Stripe', ['Home'], {
        currentPage: 'Home',
        currentPathname: '/examples/job-board',
        previewBase: true,
      }),
    ).toBe('/examples/job-board')
  })

  it('keeps commerce mutations out of navigation resolution', () => {
    expect(
      resolveRouteTarget('Add Hydrating Serum to cart', ['Home', 'Cart']),
    ).toBe(null)
  })

  it('resolves page targets to exported route hrefs', () => {
    expect(resolveRouteHref('Home', ['Home', 'Pricing'])).toBe('/')
    expect(resolveRouteHref('Pricing', ['Home', 'Pricing'])).toBe('/pricing')
  })

  it('resolves preview route hrefs relative to the generate session base', () => {
    expect(
      resolveRouteHref('Pricing', ['Home', 'Pricing'], {
        currentPage: 'Home',
        currentPathname: '/generate/session-123',
        previewBase: true,
      }),
    ).toBe('/generate/session-123/pricing')

    expect(
      resolveRouteHref('Home', ['Home', 'Pricing'], {
        currentPage: 'Pricing',
        currentPathname: '/generate/session-123/pricing',
        previewBase: true,
      }),
    ).toBe('/generate/session-123')
  })

  it('passes through absolute, hash, and explicit path hrefs without route context', () => {
    expect(resolveRouteHref('https://example.test', [])).toBe(
      'https://example.test',
    )
    expect(resolveRouteHref('#details', [])).toBe('#details')
    expect(resolveRouteHref('/pricing', [])).toBe('/pricing')
  })

  it('falls back unresolved labels to hash hrefs', () => {
    expect(resolveRouteHref('Pricing Plans', [])).toBe('#pricing-plans')
    expect(resolveRouteHref('Missing', ['Home', 'Pricing'])).toBe('#missing')
  })

  it('does not cross-map About to Team when both are semantic matches', () => {
    // When routes include "team" but not "about", "About" should NOT
    // resolve to the "team" page — they are distinct concepts.
    const routes = ['Home', 'Projects', 'Team', 'Newsletter']

    // "About" has no matching route → should fall back to hash, not /team
    const aboutHref = resolveRouteHref('About', routes)
    expect(aboutHref).toBe('#about')

    // "Team" should resolve to the team page
    const teamHref = resolveRouteHref('Team', routes)
    expect(teamHref).toBe('/team')
  })

  it('resolves Philosophy route when it is in the routes array', () => {
    // The routes array IS the source of truth. When "Philosophy" is a route,
    // it resolves directly — no targetMap needed.
    const routes = ['Home', 'Philosophy', 'Projects', 'Team', 'Newsletter']

    const philosophyHref = resolveRouteHref('Philosophy', routes)
    expect(philosophyHref).toBe('/philosophy')
  })
})
