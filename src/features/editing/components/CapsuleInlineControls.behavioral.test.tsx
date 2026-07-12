// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { createElement } from 'react'

// Mock useSectionCapsuleActions directly.
const mockActions = vi.hoisted(() => ({
  canEdit: true,
  sectionData: null as Record<string, unknown> | null,
  addItem: vi.fn(async () => {}),
  removeItem: vi.fn(async () => {}),
  reorderItem: vi.fn(async () => {}),
  editItem: vi.fn(async () => {}),
  setProp: vi.fn(async () => {}),
}))

vi.mock('../hooks/useSectionCapsuleActions', () => ({
  useSectionCapsuleActions: () => mockActions,
}))

// Mock LakebedSessionProvider as a pass-through.
vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'provider' }, children),
}))

vi.mock('@ship-fast/lakebed/server', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/server')>()
  return { ...actual }
})

import { CapsuleInlineControls } from './CapsuleInlineControls'

describe('CapsuleInlineControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActions.canEdit = true
    mockActions.sectionData = null
    mockActions.addItem.mockClear()
    mockActions.removeItem.mockClear()
    mockActions.reorderItem.mockClear()
    mockActions.editItem.mockClear()
    mockActions.setProp.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  // ─── Variant switchers ──────────────────────────────────────────────────

  it('renders inline variant switcher for CoworkingGallery columns', () => {
    mockActions.sectionData = { columns: 3, images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('columns')).toBeTruthy()
    expect(screen.getByRole('button', { name: '2' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '3' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '4' })).toBeTruthy()
  })

  it('highlights the active variant option', () => {
    mockActions.sectionData = { columns: 3, images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    const activeBtn = screen.getByRole('button', { name: '3' })
    expect(activeBtn.className).toContain('cyan-300/20')
  })

  it('calls setProp when a variant option is clicked', () => {
    mockActions.sectionData = { columns: 3, images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: '4' }))
    expect(mockActions.setProp).toHaveBeenCalledWith('columns', 4)
  })

  it('renders variant switcher for CoworkingFeatures columns', () => {
    mockActions.sectionData = { columns: 3, features: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('columns')).toBeTruthy()
  })

  // ─── Collection controls ────────────────────────────────────────────────

  it('renders collection controls with item count', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('Features')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Add/ })).toBeTruthy()
  })

  it('calls addItem when Add button is clicked', () => {
    mockActions.sectionData = { features: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: /Add/ }))
    expect(mockActions.addItem).toHaveBeenCalledTimes(1)
    expect(mockActions.addItem).toHaveBeenCalledWith(
      'features',
      expect.any(Object),
    )
  })

  it('shows remove/reorder controls when activeCollectionItem is provided', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
        { title: 'Meeting Rooms', description: 'Book by hour' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 1 },
      }),
    )

    // Active item title should be shown (not hashtag number)
    expect(screen.getByText('Private Offices')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Move up' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove item' })).toBeTruthy()
  })

  it('calls reorderItem when Move up is clicked', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 1 },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))
    expect(mockActions.reorderItem).toHaveBeenCalledWith('features', 1, 0)
  })

  it('calls reorderItem when Move down is clicked', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))
    expect(mockActions.reorderItem).toHaveBeenCalledWith('features', 0, 1)
  })

  it('calls removeItem when Remove item is clicked', async () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
      }),
    )

    // Click remove — opens AlertDialog confirmation
    fireEvent.click(screen.getByRole('button', { name: 'Remove item' }))

    // Click "Remove" in the confirmation dialog
    const confirmBtn = screen.getByRole('button', { name: 'Remove' })
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    expect(mockActions.removeItem).toHaveBeenCalledWith('features', 0)
  })

  it('disables Move up for the first item', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
      }),
    )

    expect(screen.getByRole('button', { name: 'Move up' })).toHaveProperty(
      'disabled',
      true,
    )
  })

  it('disables Move down for the last item', () => {
    mockActions.sectionData = {
      features: [
        { title: 'Hot Desks', description: 'Pick any desk' },
        { title: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 1 },
      }),
    )

    expect(screen.getByRole('button', { name: 'Move down' })).toHaveProperty(
      'disabled',
      true,
    )
  })

  it('does not show item controls when no activeCollectionItem', () => {
    mockActions.sectionData = {
      features: [{ title: 'Hot Desks', description: 'Pick any desk' }],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Move up' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove item' })).toBeNull()
  })

  // ─── Edge cases ─────────────────────────────────────────────────────────

  it('renders nothing for a capsule with no variants or collections', () => {
    mockActions.sectionData = { heading: 'Hello' }

    const { container } = render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingCta',
        statementId: 'cta_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    // CoworkingCta has only scalar string props (heading, subheading, cta)
    // — no variants or collections, so the inline controls render null.
    expect(
      container.querySelector('[data-testid="provider"]')?.children.length ?? 0,
    ).toBe(0)
  })

  it('shows loading state when canEdit is false', () => {
    mockActions.canEdit = false

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingFeatures',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('Loading section data…')).toBeTruthy()
  })

  it('renders nothing for an unknown capsule', () => {
    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'NonexistentCapsule',
        statementId: 'unknown_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.queryByText('Loading section data…')).toBeNull()
  })

  it('renders pricing tiers collection with add/remove', () => {
    mockActions.sectionData = {
      tiers: [
        { name: 'Hot Desk', price: '$199' },
        { name: 'Dedicated Desk', price: '$399' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CoworkingPricing',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
      }),
    )

    expect(screen.getByText('Tiers')).toBeTruthy()
    // Active item shows title, not hashtag
    expect(screen.getByText('Hot Desk')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Remove item' })).toBeTruthy()
  })
})
