import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('./ImageSwapPopover.tsx', import.meta.url),
  'utf8',
)

describe('ImageSwapPopover — structural invariants', () => {
  it('does NOT show source toggle buttons (Pexels/Unsplash)', () => {
    expect(source).not.toContain("setSource('pexels')")
    expect(source).not.toContain("setSource('unsplash')")
    expect(source).not.toMatch(/onClick.*setSource/)
  })

  it('does NOT show source tags on image thumbnails', () => {
    expect(source).not.toContain('{result.source}')
    expect(source).not.toMatch(/result\.source.*<\/span>/)
  })

  it('fetches 10 images per page (PER_PAGE = 10)', () => {
    expect(source).toContain('PER_PAGE = 10')
    expect(source).toMatch(/perPage:\s*PER_PAGE/)
  })

  it('uses searchStockImages (not resolveStockImage)', () => {
    expect(source).toContain('searchStockImages')
    expect(source).not.toContain('resolveStockImage')
  })

  it('has scroll-based pagination via IntersectionObserver', () => {
    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('sentinelRef')
    expect(source).toContain('loadMore')
  })

  it('tracks page state for pagination', () => {
    expect(source).toMatch(/page.*useState.*1/)
    expect(source).toMatch(/hasMore.*useState/)
  })

  it('appends results on loadMore (not replace)', () => {
    expect(source).toMatch(
      /setResults\(\(prev\) => \[\.\.\.prev, \.\.\.pageResults\]\)/,
    )
  })
})
