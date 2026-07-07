import { describe, expect, it } from 'vitest'

import {
  DESIGN_REFERENCE_LEGAL_BLOCK,
  formatDesignReferenceUrlsForPrompt,
  inferPathHintFromReferenceUrl,
} from './config/ecommerce-inspiration'

describe('ecommerce inspiration prompt references', () => {
  it('derives human-readable hints from known reference URL paths without fetching pages', () => {
    expect(
      inferPathHintFromReferenceUrl(
        'https://dribbble.com/shots/24764230-Minimal-Fashion-Store-Concept',
      ),
    ).toBe('Minimal Fashion Store Concept')
    expect(
      inferPathHintFromReferenceUrl(
        'https://example.com/lookbooks/2026-summer-capsule.html?utm=abc',
      ),
    ).toBe('summer capsule')
  })

  it('treats malformed or root-only reference URLs as safe empty path hints', () => {
    expect(inferPathHintFromReferenceUrl('not a url')).toBe('')
    expect(inferPathHintFromReferenceUrl('https://example.com/')).toBe('')
  })

  it('formats reference URLs into an originality-preserving prompt block with bounded user notes', () => {
    const notes = `Use editorial rhythm and a calm product grid. ${'x'.repeat(900)}`
    const block = formatDesignReferenceUrlsForPrompt(
      [
        'https://example.com/',
        'https://example.com/collections/linen-shirts',
        '',
      ],
      notes,
    )

    expect(block).toContain('Primary stylistic direction')
    expect(block).toContain(DESIGN_REFERENCE_LEGAL_BLOCK)
    expect(block).toContain('1. https://example.com/')
    expect(block).toContain(
      'Homepage/root URL — no path segments; rely on the user',
    )
    expect(block).toContain('2. https://example.com/collections/linen-shirts')
    expect(block).toContain('Path hint (from URL path only')
    expect(block).toContain('linen shirts')
    expect(block).toContain('Use editorial rhythm and a calm product grid.')
    expect(block.length).toBeLessThan(1800)
  })

  it('omits the prompt block when no usable reference URLs are present', () => {
    expect(formatDesignReferenceUrlsForPrompt(['', null, undefined])).toBe('')
    expect(formatDesignReferenceUrlsForPrompt('https://example.com')).toBe('')
  })
})
