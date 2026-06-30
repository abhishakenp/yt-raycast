import { describe, it, expect } from 'vitest'
import { inferKind, getDefaultFamily, KINDS, KIND_NAMES } from './kinds'

describe('kinds', () => {
  it('KINDS has 17 entries and KIND_NAMES derived', () => {
    expect(KINDS).toHaveLength(17)
    expect(KIND_NAMES).toHaveLength(17)
    expect(KIND_NAMES).toContain('commerce')
    expect(KIND_NAMES).toContain('marketing')
  })

  it('commerce prompt → commerce high confidence', () => {
    const r = inferKind(
      'build an online store to sell handmade goods and products',
    )
    expect(r.kind).toBe('commerce')
    expect(r.confidence).toBeGreaterThanOrEqual(0.65)
    expect(r.top3[0]).toBe('commerce')
  })

  it('restaurant prompt → restaurant high confidence', () => {
    const r = inferKind(
      'a restaurant with a seasonal menu and farm-to-table dining cuisine',
    )
    expect(r.kind).toBe('restaurant')
    expect(r.confidence).toBeGreaterThanOrEqual(0.65)
    expect(r.top3[0]).toBe('restaurant')
  })

  it('saas prompt → saas', () => {
    const r = inferKind(
      'a saas platform with a developer api and analytics dashboard',
    )
    expect(r.kind).toBe('saas')
    expect(r.confidence).toBeGreaterThanOrEqual(0.65)
  })

  it('unknown gibberish → marketing low confidence', () => {
    const r = inferKind('zzz qqq xyzzy florb gnarp')
    expect(r.kind).toBe('marketing')
    expect(r.confidence).toBe(0)
  })

  it('confidence ratio math: topScore/(top+second), 0/0 → 0', () => {
    // all-zero → 0
    expect(inferKind('zzz qqq').confidence).toBe(0)
    // single dominant hit → 1.0 (second=0)
    const r = inferKind('restaurant')
    expect(r.confidence).toBeGreaterThan(0)
    expect(r.confidence).toBeLessThanOrEqual(1)
  })

  it('top3 always length 3', () => {
    expect(inferKind('store shop buy').top3).toHaveLength(3)
    expect(inferKind('zzz').top3).toHaveLength(3)
    expect(
      inferKind('restaurant menu food dining chef cuisine bistro eatery').top3,
    ).toHaveLength(3)
  })

  it('getDefaultFamily returns entry default or Marketing fallback', () => {
    expect(getDefaultFamily('commerce')).toBe('Ecommerce')
    expect(getDefaultFamily('restaurant')).toBe('Restaurant')
    expect(getDefaultFamily('saas')).toBe('Saas')
    expect(getDefaultFamily('nonexistent')).toBe('Marketing')
  })
})
