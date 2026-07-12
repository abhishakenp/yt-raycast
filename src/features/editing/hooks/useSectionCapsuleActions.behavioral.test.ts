// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock the lakebed hooks before importing the module under test.
const mockUseSessionState = vi.hoisted(() =>
  vi.fn<
    (capsule: string) => {
      auth: unknown
      canWrite: boolean
      data: Record<string, unknown> | null
    }
  >(() => ({ auth: null, canWrite: false, data: null })),
)

const mockUseMergeSessionData = vi.hoisted(() =>
  vi.fn<
    (
      capsule: string,
    ) => (
      patch: Partial<Record<string, unknown>>,
    ) => Promise<Record<string, unknown>>
  >(() => vi.fn(async () => ({}))),
)

vi.mock('@ship-fast/lakebed/react', () => ({
  useSessionState: mockUseSessionState,
  useMergeSessionData: mockUseMergeSessionData,
}))

vi.mock('@ship-fast/lakebed/server', () => ({
  // JsonRecord is a type-only import, but the module needs to exist.
}))

import { useSectionCapsuleActions } from './useSectionCapsuleActions'

describe('useSectionCapsuleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('canEdit is false when data is null', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: null,
    })

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    expect(result.current.canEdit).toBe(false)
    expect(result.current.sectionData).toBeNull()
  })

  it('canEdit is false when canWrite is false', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: false,
      data: { images: [] },
    })

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    expect(result.current.canEdit).toBe(false)
  })

  it('canEdit is true when canWrite and data present', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { images: [{ alt: 'test' }] },
    })

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    expect(result.current.canEdit).toBe(true)
    expect(result.current.sectionData).toEqual({
      images: [{ alt: 'test' }],
    })
  })

  it('uses correct lakebed key: capsuleName:statementId', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {},
    })

    renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_main'),
    )

    expect(mockUseSessionState).toHaveBeenCalledWith(
      'CoworkingPricing:pricing_main',
    )
    expect(mockUseMergeSessionData).toHaveBeenCalledWith(
      'CoworkingPricing:pricing_main',
    )
  })

  it('addItem appends to existing array', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { images: [{ alt: 'existing' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.addItem('images', { alt: 'new' })
    })

    expect(mergeFn).toHaveBeenCalledWith({
      images: [{ alt: 'existing' }, { alt: 'new' }],
    })
  })

  it('addItem creates array when none exists', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {},
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.addItem('images', { alt: 'first' })
    })

    expect(mergeFn).toHaveBeenCalledWith({
      images: [{ alt: 'first' }],
    })
  })

  it('removeItem removes by index', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        tiers: [{ name: 'Basic' }, { name: 'Pro' }, { name: 'Enterprise' }],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.removeItem('tiers', 1)
    })

    expect(mergeFn).toHaveBeenCalledWith({
      tiers: [{ name: 'Basic' }, { name: 'Enterprise' }],
    })
  })

  it('reorderItem swaps elements', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        members: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingTestimonials', 'testimonials_1'),
    )

    await act(async () => {
      await result.current.reorderItem('members', 0, 2)
    })

    expect(mergeFn).toHaveBeenCalledWith({
      members: [{ name: 'Bob' }, { name: 'Charlie' }, { name: 'Alice' }],
    })
  })

  it('reorderItem does nothing for out-of-bounds indices', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { members: [{ name: 'Alice' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingTestimonials', 'testimonials_1'),
    )

    await act(async () => {
      await result.current.reorderItem('members', 0, 5)
    })

    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('editItem patches item at index', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        tiers: [
          { name: 'Basic', price: '$10' },
          { name: 'Pro', price: '$30' },
        ],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.editItem('tiers', 1, { price: '$25' })
    })

    expect(mergeFn).toHaveBeenCalledWith({
      tiers: [
        { name: 'Basic', price: '$10' },
        { name: 'Pro', price: '$25' },
      ],
    })
  })

  it('setProp merges a single key', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { heading: 'Old' },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.setProp('columns', 3)
    })

    expect(mergeFn).toHaveBeenCalledWith({ columns: 3 })
  })
})

// ─── Edge cases & regression guards ──────────────────────────────────────────

describe('useSectionCapsuleActions — edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addItem to empty array in data', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { images: [] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.addItem('images', { alt: 'first' })
    })

    expect(mergeFn).toHaveBeenCalledWith({
      images: [{ alt: 'first' }],
    })
  })

  it('addItem when data is null still writes (no canEdit guard in addItem)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: null,
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.addItem('images', { alt: 'first' })
    })

    // addItem doesn't guard on data !== null — it treats missing array as []
    expect(mergeFn).toHaveBeenCalledWith({
      images: [{ alt: 'first' }],
    })
  })

  it('removeItem on single-item array results in empty array', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: [{ name: 'Only' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.removeItem('tiers', 0)
    })

    expect(mergeFn).toHaveBeenCalledWith({ tiers: [] })
  })

  it('removeItem on non-array field is a no-op', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: 'not an array' },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.removeItem('tiers', 0)
    })

    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('removeItem with out-of-bounds index still writes (filter no-op, but merge called)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: [{ name: 'A' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.removeItem('tiers', 5)
    })

    // removeItem uses filter((_, i) => i !== 5) — index 5 never matches,
    // so the array is unchanged, but mergeData IS still called.
    expect(mergeFn).toHaveBeenCalledWith({ tiers: [{ name: 'A' }] })
  })

  it('removeItem with negative index still writes (filter no-op, but merge called)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: [{ name: 'A' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.removeItem('tiers', -1)
    })

    // filter((_, i) => i !== -1) — -1 never matches, array unchanged
    expect(mergeFn).toHaveBeenCalledWith({ tiers: [{ name: 'A' }] })
  })

  it('reorderItem to same index still writes (no same-index guard)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { members: [{ name: 'Alice' }, { name: 'Bob' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingTestimonials', 'testimonials_1'),
    )

    await act(async () => {
      await result.current.reorderItem('members', 1, 1)
    })

    // reorderItem doesn't guard same-index — it splices and reinserts at
    // the same position, producing an equivalent array but still writes.
    expect(mergeFn).toHaveBeenCalledWith({
      members: [{ name: 'Alice' }, { name: 'Bob' }],
    })
  })

  it('reorderItem on non-array field is a no-op', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { members: 'not an array' },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingTestimonials', 'testimonials_1'),
    )

    await act(async () => {
      await result.current.reorderItem('members', 0, 1)
    })

    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('reorderItem moves item to end (from=0, to=last)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        tiers: [{ name: 'Basic' }, { name: 'Pro' }, { name: 'Enterprise' }],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.reorderItem('tiers', 0, 2)
    })

    expect(mergeFn).toHaveBeenCalledWith({
      tiers: [{ name: 'Pro' }, { name: 'Enterprise' }, { name: 'Basic' }],
    })
  })

  it('reorderItem moves item to start (from=last, to=0)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        tiers: [{ name: 'Basic' }, { name: 'Pro' }, { name: 'Enterprise' }],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.reorderItem('tiers', 2, 0)
    })

    expect(mergeFn).toHaveBeenCalledWith({
      tiers: [{ name: 'Enterprise' }, { name: 'Basic' }, { name: 'Pro' }],
    })
  })

  it('editItem on non-array field is a no-op', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: 'not an array' },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.editItem('tiers', 0, { name: 'X' })
    })

    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('editItem with out-of-bounds index is a no-op', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: [{ name: 'A' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.editItem('tiers', 5, { name: 'X' })
    })

    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('editItem preserves other fields in the item', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {
        tiers: [{ name: 'Basic', price: '$10', features: ['A', 'B'] }],
      },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.editItem('tiers', 0, { price: '$15' })
    })

    expect(mergeFn).toHaveBeenCalledWith({
      tiers: [{ name: 'Basic', price: '$15', features: ['A', 'B'] }],
    })
  })

  it('editItem on non-object item is a no-op', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { tiers: ['string item', { name: 'A' }] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.editItem('tiers', 0, { name: 'X' })
    })

    // The first item is a string, not an object — edit should be a no-op
    expect(mergeFn).not.toHaveBeenCalled()
  })

  it('setProp overwrites existing value', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { columns: 2, images: [] },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.setProp('columns', 4)
    })

    expect(mergeFn).toHaveBeenCalledWith({ columns: 4 })
  })

  it('setProp with boolean value', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { showPrice: false },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'pricing_1'),
    )

    await act(async () => {
      await result.current.setProp('showPrice', true)
    })

    expect(mergeFn).toHaveBeenCalledWith({ showPrice: true })
  })

  it('setProp with string value', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: { buttonText: 'Old' },
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingHero', 'hero_1'),
    )

    await act(async () => {
      await result.current.setProp('buttonText', 'New Text')
    })

    expect(mergeFn).toHaveBeenCalledWith({ buttonText: 'New Text' })
  })

  it('setProp when data is null still writes (no data guard in setProp)', async () => {
    const mergeFn = vi.fn(async () => ({}))
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: null,
    })
    mockUseMergeSessionData.mockReturnValue(mergeFn)

    const { result } = renderHook(() =>
      useSectionCapsuleActions('CoworkingGallery', 'gallery_1'),
    )

    await act(async () => {
      await result.current.setProp('columns', 3)
    })

    // setProp doesn't guard on data — it always writes
    expect(mergeFn).toHaveBeenCalledWith({ columns: 3 })
  })

  // ── Lakebed key format regression ────────────────────────────────────────

  it('uses capsuleName:statementId format for different capsule types', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {},
    })

    const cases: Array<[string, string, string]> = [
      ['CoworkingHero', 'home_hero', 'CoworkingHero:home_hero'],
      ['CoworkingPricing', 'home_pricing', 'CoworkingPricing:home_pricing'],
      ['CoworkingGallery', 'home_gallery', 'CoworkingGallery:home_gallery'],
      [
        'CoworkingTestimonials',
        'home_testimonials',
        'CoworkingTestimonials:home_testimonials',
      ],
      ['CoworkingFeatures', 'home_features', 'CoworkingFeatures:home_features'],
    ]

    for (const [capsuleName, statementId, expectedKey] of cases) {
      vi.clearAllMocks()
      mockUseSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: {},
      })

      renderHook(() => useSectionCapsuleActions(capsuleName, statementId))

      expect(mockUseSessionState).toHaveBeenCalledWith(expectedKey)
      expect(mockUseMergeSessionData).toHaveBeenCalledWith(expectedKey)
    }
  })

  it('uses different keys for same capsule on different pages', () => {
    mockUseSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: {},
    })

    // Same capsule name, different statementId → different key
    renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'home_pricing'),
    )
    expect(mockUseSessionState).toHaveBeenLastCalledWith(
      'CoworkingPricing:home_pricing',
    )

    renderHook(() =>
      useSectionCapsuleActions('CoworkingPricing', 'about_pricing'),
    )
    expect(mockUseSessionState).toHaveBeenLastCalledWith(
      'CoworkingPricing:about_pricing',
    )
  })
})
