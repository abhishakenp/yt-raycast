import { describe, it, expect } from 'vitest'
import {
  hasGalleryReadySignal,
  isGalleryVisibleSession,
  galleryCategoryTerms,
  getGalleryCategories,
  formatGalleryCategory,
  getGalleryCategoryOptions,
  matchesGalleryFilters,
} from './gallery-helpers'

const makeSession = (overrides: Record<string, unknown> = {}) =>
  ({ _id: 'session-1', prompt: '', ...overrides }) as any

describe('hasGalleryReadySignal', () => {
  it('returns true when genuiStatus is done', () => {
    expect(hasGalleryReadySignal(makeSession({ genuiStatus: 'done' }))).toBe(true)
  })

  it('returns true when openuiReady is true', () => {
    expect(hasGalleryReadySignal(makeSession({ openuiReady: true }))).toBe(true)
  })

  it('returns true when status is preview_ready', () => {
    expect(hasGalleryReadySignal(makeSession({ status: 'preview_ready' }))).toBe(true)
  })

  it('returns true when previewVersion > 0', () => {
    expect(hasGalleryReadySignal(makeSession({ previewVersion: 1 }))).toBe(true)
    expect(hasGalleryReadySignal(makeSession({ previewVersion: 5 }))).toBe(true)
  })

  it('returns false when previewVersion is 0', () => {
    expect(hasGalleryReadySignal(makeSession({ previewVersion: 0 }))).toBe(false)
  })

  it('returns false when previewVersion is undefined (defaults to 0)', () => {
    expect(hasGalleryReadySignal(makeSession({}))).toBe(false)
  })

  it('returns false when no ready signal is present', () => {
    expect(
      hasGalleryReadySignal(
        makeSession({ genuiStatus: 'streaming', openuiReady: false, status: 'created', previewVersion: 0 }),
      ),
    ).toBe(false)
  })

  it('returns true when multiple signals are present', () => {
    expect(
      hasGalleryReadySignal(
        makeSession({ genuiStatus: 'done', openuiReady: true, status: 'preview_ready', previewVersion: 3 }),
      ),
    ).toBe(true)
  })

  it('returns false when openuiReady is false', () => {
    expect(hasGalleryReadySignal(makeSession({ openuiReady: false }))).toBe(false)
  })
})

describe('isGalleryVisibleSession', () => {
  it('returns true for ongoing status with ready signal', () => {
    expect(isGalleryVisibleSession(makeSession({ status: 'streaming', genuiStatus: 'done' }))).toBe(true)
  })

  it('returns false for ongoing status without ready signal', () => {
    expect(isGalleryVisibleSession(makeSession({ status: 'created' }))).toBe(false)
    expect(isGalleryVisibleSession(makeSession({ status: 'queued' }))).toBe(false)
    expect(isGalleryVisibleSession(makeSession({ status: 'validating' }))).toBe(false)
    expect(isGalleryVisibleSession(makeSession({ status: 'streaming' }))).toBe(false)
  })

  it('returns true for non-ongoing status regardless of ready signal', () => {
    expect(isGalleryVisibleSession(makeSession({ status: 'completed' }))).toBe(true)
    expect(isGalleryVisibleSession(makeSession({ status: 'error' }))).toBe(true)
    expect(isGalleryVisibleSession(makeSession({ status: 'preview_ready' }))).toBe(true)
  })

  it('falls back to hasGalleryReadySignal when status is undefined', () => {
    expect(isGalleryVisibleSession(makeSession({ status: undefined, genuiStatus: 'done' }))).toBe(true)
    expect(isGalleryVisibleSession(makeSession({ status: undefined }))).toBe(false)
  })
})

describe('galleryCategoryTerms', () => {
  it('contains expected categories', () => {
    expect(Object.keys(galleryCategoryTerms)).toEqual([
      'saas',
      'commerce',
      'portfolio',
      'blog',
      'service',
      'app',
    ])
  })

  it('has non-empty arrays for every category', () => {
    for (const terms of Object.values(galleryCategoryTerms)) {
      expect(terms.length).toBeGreaterThan(0)
    }
  })
})

describe('getGalleryCategories', () => {
  it('matches a single category', () => {
    expect(getGalleryCategories('Build a SaaS dashboard')).toEqual(['saas'])
  })

  it('matches multiple categories', () => {
    const result = getGalleryCategories('SaaS blog platform')
    expect(result).toContain('saas')
    expect(result).toContain('blog')
  })

  it('is case insensitive', () => {
    expect(getGalleryCategories('SAAS DASHBOARD')).toEqual(['saas'])
    expect(getGalleryCategories('My Blog')).toEqual(['blog'])
  })

  it('returns empty array for no matches', () => {
    expect(getGalleryCategories('just a random string with no keywords')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(getGalleryCategories('')).toEqual([])
  })

  it('matches multi-word terms like "case studies"', () => {
    expect(getGalleryCategories('A firm with case studies')).toContain('portfolio')
  })

  it('matches partial words (substring match)', () => {
    expect(getGalleryCategories('my ecommerce site')).toContain('commerce')
  })

  it('preserves category order from galleryCategoryTerms', () => {
    const result = getGalleryCategories('app with blog and store for saas')
    expect(result).toEqual(['saas', 'commerce', 'blog', 'app'])
  })
})

describe('formatGalleryCategory', () => {
  it('title-cases a simple word', () => {
    expect(formatGalleryCategory('saas')).toBe('Saas')
  })

  it('title-cases kebab-case', () => {
    expect(formatGalleryCategory('my-category')).toBe('My Category')
  })

  it('title-cases snake_case', () => {
    expect(formatGalleryCategory('my_category')).toBe('My Category')
  })

  it('title-cases space-separated', () => {
    expect(formatGalleryCategory('my category')).toBe('My Category')
  })

  it('handles mixed separators', () => {
    expect(formatGalleryCategory('my-cool_app thing')).toBe('My Cool App Thing')
  })

  it('handles multiple consecutive separators', () => {
    expect(formatGalleryCategory('my--category')).toBe('My Category')
  })

  it('handles empty string', () => {
    expect(formatGalleryCategory('')).toBe('')
  })

  it('handles leading/trailing separators', () => {
    expect(formatGalleryCategory('-hello-')).toBe('Hello')
  })
})

describe('getGalleryCategoryOptions', () => {
  it('returns empty array for no sessions', () => {
    expect(getGalleryCategoryOptions([])).toEqual([])
  })

  it('returns category options with counts', () => {
    const sessions = [
      makeSession({ prompt: 'Build a SaaS dashboard' }),
      makeSession({ prompt: 'Another SaaS platform' }),
      makeSession({ prompt: 'A blog about dogs' }),
    ]
    const result = getGalleryCategoryOptions(sessions as any)
    expect(result).toEqual([
      { value: 'saas', label: 'Saas', count: 2 },
      { value: 'blog', label: 'Blog', count: 1 },
    ])
  })

  it('sorts by count descending then alphabetically', () => {
    const sessions = [
      makeSession({ prompt: 'ecommerce store' }),
      makeSession({ prompt: 'another store checkout' }),
      makeSession({ prompt: 'blog publication' }),
      makeSession({ prompt: 'SaaS analytics' }),
    ]
    const result = getGalleryCategoryOptions(sessions as any)
    expect(result[0]).toMatchObject({ value: 'commerce', count: 2 })
    // saas and blog both have count 1, alphabetical order: blog < saas
    const countOneOptions = result.filter((o) => o.count === 1)
    expect(countOneOptions.map((o) => o.value)).toEqual(['blog', 'saas'])
  })

  it('counts sessions matching multiple categories once per category', () => {
    const sessions = [makeSession({ prompt: 'SaaS blog platform with store' })]
    const result = getGalleryCategoryOptions(sessions as any)
    expect(result).toHaveLength(3)
    expect(result.every((o) => o.count === 1)).toBe(true)
  })

  it('skips sessions with no matching categories', () => {
    const sessions = [
      makeSession({ prompt: 'something random' }),
      makeSession({ prompt: 'SaaS dashboard' }),
    ]
    const result = getGalleryCategoryOptions(sessions as any)
    expect(result).toEqual([{ value: 'saas', label: 'Saas', count: 1 }])
  })
})

describe('matchesGalleryFilters', () => {
  const saasSession = makeSession({ _id: 'sess-1', prompt: 'Build a SaaS dashboard', status: 'completed' })

  describe('category filtering', () => {
    it('passes when no category is provided', () => {
      expect(matchesGalleryFilters(saasSession, undefined, undefined)).toBe(true)
    })

    it('passes when category is empty string', () => {
      expect(matchesGalleryFilters(saasSession, undefined, '')).toBe(true)
    })

    it('passes when category is whitespace only', () => {
      expect(matchesGalleryFilters(saasSession, undefined, '   ')).toBe(true)
    })

    it('passes when category matches', () => {
      expect(matchesGalleryFilters(saasSession, undefined, 'saas')).toBe(true)
    })

    it('matches category case-insensitively', () => {
      expect(matchesGalleryFilters(saasSession, undefined, 'SAAS')).toBe(true)
      expect(matchesGalleryFilters(saasSession, undefined, 'SaaS')).toBe(true)
    })

    it('trims category whitespace', () => {
      expect(matchesGalleryFilters(saasSession, undefined, '  saas  ')).toBe(true)
    })

    it('rejects when category does not match', () => {
      expect(matchesGalleryFilters(saasSession, undefined, 'blog')).toBe(false)
    })
  })

  describe('search filtering', () => {
    it('passes when no search is provided', () => {
      expect(matchesGalleryFilters(saasSession, undefined, undefined)).toBe(true)
    })

    it('passes when search is empty string', () => {
      expect(matchesGalleryFilters(saasSession, '', undefined)).toBe(true)
    })

    it('passes when search is whitespace only', () => {
      expect(matchesGalleryFilters(saasSession, '   ', undefined)).toBe(true)
    })

    it('matches against prompt', () => {
      expect(matchesGalleryFilters(saasSession, 'dashboard', undefined)).toBe(true)
    })

    it('matches against session _id', () => {
      expect(matchesGalleryFilters(saasSession, 'sess-1', undefined)).toBe(true)
    })

    it('matches against status', () => {
      expect(matchesGalleryFilters(saasSession, 'completed', undefined)).toBe(true)
    })

    it('matches against genuiStatus', () => {
      const session = makeSession({ prompt: 'test', genuiStatus: 'done' })
      expect(matchesGalleryFilters(session, 'done', undefined)).toBe(true)
    })

    it('matches against derived category names', () => {
      expect(matchesGalleryFilters(saasSession, 'saas', undefined)).toBe(true)
    })

    it('uses "website" as fallback category when no categories match', () => {
      const session = makeSession({ prompt: 'something random' })
      expect(matchesGalleryFilters(session, 'website', undefined)).toBe(true)
    })

    it('is case insensitive', () => {
      expect(matchesGalleryFilters(saasSession, 'DASHBOARD', undefined)).toBe(true)
    })

    it('rejects when search does not match any field', () => {
      expect(matchesGalleryFilters(saasSession, 'nonexistent', undefined)).toBe(false)
    })

    it('skips undefined/non-string fields gracefully', () => {
      const session = makeSession({ prompt: 'test', status: undefined, genuiStatus: undefined })
      expect(matchesGalleryFilters(session, 'test', undefined)).toBe(true)
      expect(matchesGalleryFilters(session, 'undefined', undefined)).toBe(false)
    })
  })

  describe('combined category + search', () => {
    it('requires both category and search to match', () => {
      expect(matchesGalleryFilters(saasSession, 'dashboard', 'saas')).toBe(true)
    })

    it('rejects if category matches but search does not', () => {
      expect(matchesGalleryFilters(saasSession, 'nonexistent', 'saas')).toBe(false)
    })

    it('rejects if search matches but category does not', () => {
      expect(matchesGalleryFilters(saasSession, 'dashboard', 'blog')).toBe(false)
    })
  })
})
