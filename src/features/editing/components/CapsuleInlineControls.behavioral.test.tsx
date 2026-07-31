// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { createElement, type MutableRefObject, type ReactNode } from 'react'

// Mock useSectionCapsuleActions directly.
const mockActions = vi.hoisted(() => ({
  canEdit: true,
  sectionData: null as Record<string, unknown> | null,
  addItem: vi.fn(async () => {}),
  removeItem: vi.fn(async () => {}),
  reorderItem: vi.fn(async () => {}),
  editItem: vi.fn(async () => {}),
  setProp: vi.fn(async () => {}),
  mergeData: vi.fn(async () => {}),
}))

vi.mock('../hooks/useSectionCapsuleActions', () => ({
  useSectionCapsuleActions: () => mockActions,
}))

// Mock LakebedSessionProvider as a pass-through.
vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children?: ReactNode }) =>
    createElement('div', { 'data-testid': 'provider' }, children),
}))

vi.mock('@ship-fast/lakebed/server', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/server')>()
  return { ...actual }
})

vi.mock('../hooks/useRuntimeCapsuleSchemaInfo', async () => {
  const { allCapsules } = await import('@ship-fast/blocks')
  const { hasContextInfo, introspectCapsuleSchema } =
    await import('@ship-fast/blocks/capsules')
  const lookup = (capsuleName: string) => {
    const capsule = allCapsules.find((c) => c.client.name === capsuleName)
    const propsSchema = capsule?.client.props
    if (!propsSchema) return null
    const info = introspectCapsuleSchema(propsSchema)
    return hasContextInfo(info) ? info : null
  }
  return {
    loadRuntimeCapsuleSchemaInfo: async (capsuleName: string) =>
      lookup(capsuleName),
    useRuntimeCapsuleSchemaInfo: lookup,
  }
})

import {
  CapsuleInlineControls,
  type CapsuleInlineHandle,
} from './CapsuleInlineControls'

function makeHandleRef(): MutableRefObject<CapsuleInlineHandle | null> {
  return {
    current: null,
  }
}

function makeCapsuleElementWithArticles(labels: string[]) {
  const section = document.createElement('section')
  const grid = document.createElement('div')
  for (const label of labels) {
    const article = document.createElement('article')
    article.textContent = label
    grid.appendChild(article)
  }
  section.appendChild(grid)
  document.body.appendChild(section)
  return { section, grid }
}

function childTextOrder(element: HTMLElement) {
  return Array.from(element.children)
    .map((child) => child.textContent)
    .join('|')
}

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
    mockActions.mergeData.mockClear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  // ─── Variant switchers ──────────────────────────────────────────────────

  it('renders inline variant switcher for ImageGallery chrome', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('chrome')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'hairline' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'editorial' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'brutalist' })).toBeTruthy()
  })

  it('highlights the active variant option', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    const activeBtn = screen.getByRole('button', { name: 'editorial' })
    expect(activeBtn.className).toContain('cyan-300/20')
  })

  it('does not persist variant changes immediately when a variant option is clicked', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'brutalist' }))
    expect(mockActions.setProp).not.toHaveBeenCalled()
  })

  it('renders variant switcher for FeatureList chrome', () => {
    mockActions.sectionData = { chrome: 'editorial', features: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('chrome')).toBeTruthy()
  })

  // ─── Collection controls ────────────────────────────────────────────────

  it('renders collection controls with item count', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('Features')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Add/ })).toBeTruthy()
  })

  it('does not persist new collection items immediately when Add is clicked', () => {
    mockActions.sectionData = { features: [] }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: /Add/ }))
    expect(mockActions.addItem).not.toHaveBeenCalled()
  })

  it('shows remove/reorder controls when activeCollectionItem is provided', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
        { heading: 'Meeting Rooms', description: 'Book by hour' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
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

  it('buffers reorder locally when Move up is clicked (no immediate backend call)', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 1 },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))
    // reorderItem should NOT be called immediately — it's buffered
    expect(mockActions.reorderItem).not.toHaveBeenCalled()
  })

  it('buffers reorder locally when Move down is clicked (no immediate backend call)', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))
    expect(mockActions.reorderItem).not.toHaveBeenCalled()
  })

  it('previews buffered reorder in the DOM and restores it on discard', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }
    const handleRef = makeHandleRef()
    const { section, grid } = makeCapsuleElementWithArticles([
      'Hot Desks',
      'Private Offices',
    ])

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
        handleRef,
        capsuleElement: section,
      }),
    )

    expect(childTextOrder(grid)).toBe('Hot Desks|Private Offices')
    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))

    expect(childTextOrder(grid)).toBe('Private Offices|Hot Desks')
    expect(mockActions.mergeData).not.toHaveBeenCalled()

    act(() => {
      handleRef.current?.discard()
    })

    expect(childTextOrder(grid)).toBe('Hot Desks|Private Offices')
    expect(mockActions.mergeData).not.toHaveBeenCalled()
  })

  it('commits buffered reorder only when the inline handle is committed', async () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }
    const handleRef = makeHandleRef()
    const { section } = makeCapsuleElementWithArticles([
      'Hot Desks',
      'Private Offices',
    ])

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
        handleRef,
        capsuleElement: section,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))
    expect(mockActions.mergeData).not.toHaveBeenCalled()

    await act(async () => {
      await handleRef.current?.commit()
    })

    expect(mockActions.mergeData).toHaveBeenCalledWith({
      features: [
        { heading: 'Private Offices', description: 'Lockable rooms' },
        { heading: 'Hot Desks', description: 'Pick any desk' },
      ],
    })
  })

  it('does not commit a reorder after the inline handle discards it', async () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }
    const handleRef = makeHandleRef()
    const { section } = makeCapsuleElementWithArticles([
      'Hot Desks',
      'Private Offices',
    ])

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
        activeCollectionItem: { collectionKey: '__auto__', index: 0 },
        handleRef,
        capsuleElement: section,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))
    act(() => {
      handleRef.current?.discard()
    })
    await act(async () => {
      await handleRef.current?.commit()
    })

    expect(mockActions.mergeData).not.toHaveBeenCalled()
  })

  it('does not persist removal immediately when Remove item is confirmed', async () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
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

    expect(mockActions.removeItem).not.toHaveBeenCalled()
  })

  it('disables Move up for the first item', () => {
    mockActions.sectionData = {
      features: [
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
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
        { heading: 'Hot Desks', description: 'Pick any desk' },
        { heading: 'Private Offices', description: 'Lockable rooms' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
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

  it('auto-selects first item when no activeCollectionItem', () => {
    mockActions.sectionData = {
      features: [{ heading: 'Hot Desks', description: 'Pick any desk' }],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'FeatureList',
        statementId: 'features_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    // First item should be auto-selected — buttons should be present
    expect(screen.getByRole('button', { name: 'Move down' })).toBeTruthy()
    // Move up disabled since it's the first (and only) item
    expect(screen.getByRole('button', { name: 'Remove item' })).toBeTruthy()
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
        capsuleName: 'FeatureList',
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
        capsuleName: 'PricingTable',
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

  it('renders independent controls for every collection in CardGrid', () => {
    mockActions.sectionData = {
      cards: [
        { title: 'Camera Kit', description: 'Photography' },
        { title: 'Audio Kit', description: 'Audio gear' },
      ],
    }

    render(
      createElement(CapsuleInlineControls, {
        capsuleName: 'CardGrid',
        statementId: 'deals_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('Cards')).toBeTruthy()
    expect(screen.getByText('Camera Kit')).toBeTruthy()
    expect(screen.getAllByRole('combobox').length).toBe(1)
    expect(screen.getAllByTitle('Move down').length).toBe(1)
    expect(screen.getAllByRole('button', { name: 'Remove item' }).length).toBe(
      1,
    )
  })
})
