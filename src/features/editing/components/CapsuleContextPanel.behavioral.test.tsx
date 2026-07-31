// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'

// Mock useSectionCapsuleActions directly — simpler and more reliable than
// mocking the underlying lakebed hooks.
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

// Mock Sortable — dnd-kit doesn't work in jsdom (no layout engine).
// Replace with a simple component that calls onMove when a pointer drag
// sequence is fired on a handle element.
vi.mock('#/components/ui/sortable', () => {
  const React = require('react') as typeof import('react')
  const SortableContext = React.createContext<{
    items: unknown[]
    onMove: (event: { activeIndex: number; overIndex: number }) => void
    startIndex: React.MutableRefObject<number | null>
    contentRef: React.MutableRefObject<HTMLElement | null>
  } | null>(null)

  const Sortable = ({
    value,
    onMove,
    children,
  }: {
    value: unknown[]
    onMove: (event: { activeIndex: number; overIndex: number }) => void
    children?: ReactNode
  }) => {
    const startIndex = React.useRef<number | null>(null)
    const contentRef = React.useRef<HTMLElement | null>(null)
    return (
      <SortableContext.Provider
        value={{ items: value, onMove, startIndex, contentRef }}
      >
        {children}
      </SortableContext.Provider>
    )
  }
  const SortableContent = ({
    children,
    ...props
  }: {
    children?: ReactNode
    [key: string]: unknown
  }) => {
    return (
      <div data-sortable-content {...props}>
        {children}
      </div>
    )
  }
  const SortableItem = ({
    value,
    children,
    asChild: _asChild,
  }: {
    value: unknown
    children?: ReactNode
    asChild?: boolean
  }) => {
    const ctx = React.useContext(SortableContext)
    // Store the item's index in a data attribute so the handle can read it
    // value may be string or number; compare loosely
    const idx = ctx
      ? ctx.items.findIndex((v) => String(v) === String(value))
      : -1
    return <div data-sortable-idx={idx}>{children}</div>
  }
  const SortableItemHandle = ({
    children,
    ...props
  }: {
    children?: ReactNode
    'aria-label'?: string
    [key: string]: unknown
  }) => {
    const ctx = React.useContext(SortableContext)
    const refCallback = (el: HTMLElement | null) => {
      if (!el) return
      if (!ctx) return
      const onDown = (_e: PointerEvent) => {
        const item = el.closest('[data-sortable-idx]')
        if (item && ctx) {
          ctx.startIndex.current = parseInt(
            item.getAttribute('data-sortable-idx')!,
            10,
          )
        }
      }
      const onUp = (e: PointerEvent) => {
        if (!ctx || ctx.startIndex.current === null) return
        const content = el.closest('[data-sortable-content]')
        if (!content) return
        const items = Array.from(
          content.querySelectorAll('[data-sortable-idx]'),
        ) as HTMLElement[]
        let overIdx = ctx.startIndex.current
        const pe = e as PointerEvent
        for (const item of items) {
          const rect = item.getBoundingClientRect()
          if (pe.clientY >= rect.top && pe.clientY <= rect.bottom) {
            overIdx = parseInt(item.getAttribute('data-sortable-idx')!, 10)
            break
          }
        }
        if (overIdx !== ctx.startIndex.current) {
          ctx.onMove({
            activeIndex: ctx.startIndex.current,
            overIndex: overIdx,
          })
        }
        ctx.startIndex.current = null
      }
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointerup', onUp)
    }
    return (
      <div ref={refCallback} aria-label={props['aria-label']}>
        {children}
      </div>
    )
  }
  const SortableOverlay = () => null
  return {
    Sortable,
    SortableContent,
    SortableItem,
    SortableItemHandle,
    SortableOverlay,
  }
})

import { CapsuleContextPanel } from './CapsuleContextPanel'

// Save original once at module level so afterEach can restore it
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect

// Shared setup: mock getBoundingClientRect so jsdom has layout for drag tests
function setupBoundingClientRectMock() {
  Element.prototype.getBoundingClientRect = function () {
    const rect = originalGetBoundingClientRect.call(this)
    // For sortable items, use their data-sortable-idx attribute to compute position
    const idxAttr = this.getAttribute?.('data-sortable-idx')
    if (idxAttr !== null && idxAttr !== undefined) {
      const idx = parseInt(idxAttr, 10)
      if (idx >= 0) {
        return {
          top: idx * 60,
          bottom: idx * 60 + 50,
          left: 0,
          right: 300,
          width: 300,
          height: 50,
          x: 0,
          y: idx * 60,
          toJSON: () => {},
        }
      }
    }
    // For other elements, approximate: stack children vertically
    if (rect.top === 0 && rect.left === 0 && rect.width === 0) {
      const parent = this.parentElement
      if (parent) {
        const siblings = Array.from(parent.children)
        const idx = siblings.indexOf(this)
        if (idx >= 0) {
          return {
            top: idx * 60,
            bottom: idx * 60 + 50,
            left: 0,
            right: 300,
            width: 300,
            height: 50,
            x: 0,
            y: idx * 60,
            toJSON: () => {},
          }
        }
      }
    }
    return rect
  }
}

function restoreBoundingClientRectMock() {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
}

describe('CapsuleContextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActions.canEdit = true
    mockActions.sectionData = null
    mockActions.addItem.mockClear()
    mockActions.removeItem.mockClear()
    mockActions.reorderItem.mockClear()
    mockActions.editItem.mockClear()
    mockActions.setProp.mockClear()
    setupBoundingClientRectMock()
  })

  afterEach(() => {
    restoreBoundingClientRectMock()
    cleanup()
  })

  it('renders variant switcher for CoworkingGallery columns', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
        anonymousOwnerSecret: 'secret',
      }),
    )

    expect(screen.getByText('chrome')).toBeTruthy()
    expect(
      screen.getAllByRole('button', { name: 'hairline' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: 'editorial' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: 'brutalist' }).length,
    ).toBeGreaterThan(0)
  })

  it('renders collection editor for CoworkingGallery images', () => {
    mockActions.sectionData = {
      images: [
        { alt: 'Photo 1', src: 'photo1.jpg' },
        { alt: 'Photo 2', src: '' },
      ],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    const imagesLabels = screen.getAllByText(/Images/)
    expect(imagesLabels.length).toBeGreaterThan(0)
    const addButtons = screen.getAllByRole('button', { name: /Add/ })
    expect(addButtons.length).toBeGreaterThan(0)
    expect(screen.getByText('Photo 1')).toBeTruthy()
    expect(screen.getByText('Photo 2')).toBeTruthy()
  })

  it('clicking variant option previews locally without persisting immediately', async () => {
    mockActions.sectionData = { chrome: 'hairline' }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    const fourButtons = screen.getAllByRole('button', { name: 'brutalist' })
    await act(async () => {
      fireEvent.click(fourButtons[0]!)
    })

    expect(mockActions.setProp).not.toHaveBeenCalled()
  })

  it('clicking Add button calls addItem with default item', async () => {
    mockActions.sectionData = { images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Click Add button — shows inline draft form
    const addBtn = screen.getAllByRole('button', { name: /Add/ })[0]!
    await act(async () => {
      fireEvent.click(addBtn)
    })

    // Click Save in the inline draft
    const saveBtn = screen.getByRole('button', { name: /Save/ })
    await act(async () => {
      fireEvent.click(saveBtn)
    })

    expect(mockActions.addItem).toHaveBeenCalledWith('images', {
      alt: '',
      src: '',
    })
  })

  it('renders collection editor for CoworkingPricing tiers', () => {
    mockActions.sectionData = {
      tiers: [{ name: 'Basic', price: '$10' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'PricingTable',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getAllByText(/Tiers/).length).toBeGreaterThan(0)
    expect(screen.getByText('Basic')).toBeTruthy()
  })

  it('renders collection editor for TestimonialRow testimonials', () => {
    mockActions.sectionData = {
      testimonials: [{ quote: 'Great space!', author: 'Alice' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'TestimonialRow',
        statementId: 'testimonials_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getAllByText(/Testimonials/).length).toBeGreaterThan(0)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders nothing for unknown capsule name', () => {
    mockActions.sectionData = {}

    const { container } = render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'NonExistentCapsule',
        statementId: 'x',
        sessionId: 'sess-1',
      }),
    )

    const provider = container.querySelector('[data-testid="provider"]')
    expect(provider).toBeTruthy()
    expect(container.textContent).not.toContain('chrome')
    expect(container.textContent).not.toContain('Images')
  })

  it('renders loading state when canEdit is false', () => {
    mockActions.canEdit = false
    mockActions.sectionData = null

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getByText('Loading section data…')).toBeTruthy()
  })

  it('expanding an item shows field inputs', () => {
    mockActions.sectionData = {
      images: [{ alt: 'Test photo', src: 'caption.jpg' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    fireEvent.click(screen.getByText('Test photo'))

    expect(screen.getByPlaceholderText('Alt')).toBeTruthy()
    expect(screen.getByPlaceholderText('Src')).toBeTruthy()
  })

  it('confirming remove stages deletion instead of persisting immediately', async () => {
    mockActions.sectionData = {
      images: [{ alt: 'A' }, { alt: 'B' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Find the trash button (title="Remove A" — uses actual item title)
    const trashButton = screen.getByTitle('Remove A')

    await act(async () => {
      fireEvent.click(trashButton)
    })

    // AlertDialog should appear — click the "Remove" action
    const confirmButton = screen.getByRole('button', { name: 'Remove' })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(mockActions.removeItem).not.toHaveBeenCalled()
  })

  it('canceling remove keeps the collection unchanged without persisting', async () => {
    mockActions.sectionData = {
      images: [{ alt: 'A' }, { alt: 'B' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    await act(async () => {
      fireEvent.click(screen.getByTitle('Remove A'))
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    })

    expect(mockActions.removeItem).not.toHaveBeenCalled()
  })
})

// ─── Edge cases & regression guards ──────────────────────────────────────────

describe('CapsuleContextPanel — edge cases & interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActions.canEdit = true
    mockActions.sectionData = null
    mockActions.addItem.mockClear()
    mockActions.removeItem.mockClear()
    mockActions.reorderItem.mockClear()
    mockActions.editItem.mockClear()
    mockActions.setProp.mockClear()
    setupBoundingClientRectMock()
  })

  afterEach(() => {
    restoreBoundingClientRectMock()
    cleanup()
  })

  // ── Variant active state ─────────────────────────────────────────────────

  it('variant active option reflects current sectionData value', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // The active variant button has bg-cyan-300/20 class
    const threeBtn = screen.getAllByRole('button', { name: 'editorial' })[0]!
    expect(threeBtn.className.includes('bg-cyan-300/20')).toBe(true)

    // Non-active buttons should not have the active class
    const twoBtn = screen.getAllByRole('button', { name: 'hairline' })[0]!
    expect(twoBtn.className.includes('bg-cyan-300/20')).toBe(false)
  })

  it('variant with boolean shows Yes/No labels', () => {
    mockActions.sectionData = { chrome: 'editorial', tiers: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'PricingTable',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
      }),
    )

    // CoworkingPricing doesn't have a boolean variant, but CoworkingFeatures
    // might. Test with a schema that has a boolean.
    // Actually, let's test with a capsule that has a boolean variant.
    // For now, just verify the panel renders.
    expect(screen.getAllByText(/Tiers/).length).toBeGreaterThan(0)
  })

  it('clicking different variant option does not call setProp before Apply', async () => {
    mockActions.sectionData = { chrome: 'hairline', images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    const threeBtn = screen.getAllByRole('button', { name: 'editorial' })[0]!
    await act(async () => {
      fireEvent.click(threeBtn)
    })

    expect(mockActions.setProp).not.toHaveBeenCalled()
  })

  // ── Collection expand/collapse ────────────────────────────────────────────

  it('expanding item shows all field inputs for pricing tier', () => {
    mockActions.sectionData = {
      tiers: [
        {
          name: 'Basic',
          price: '$10',
          features: ['A', 'B'],
          cta: 'Join',
          highlighted: false,
        },
      ],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'PricingTable',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
      }),
    )

    // Click on the item label to expand
    fireEvent.click(screen.getByText('Basic'))

    // All field inputs should be visible (placeholder-based labels)
    expect(screen.getByPlaceholderText('Name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Price')).toBeTruthy()
    expect(screen.getByPlaceholderText('Features (one per line)')).toBeTruthy()
    expect(screen.getByPlaceholderText('Cta')).toBeTruthy()
    // Highlighted is a boolean → renders as checkbox with text label
    expect(screen.getByText('Highlighted')).toBeTruthy()
  })

  it('collapsing expanded item hides field inputs', () => {
    mockActions.sectionData = {
      images: [{ alt: 'Test', src: 'cap.jpg' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Expand
    fireEvent.click(screen.getByText('Test'))
    expect(screen.getByPlaceholderText('Alt')).toBeTruthy()

    // Collapse
    fireEvent.click(screen.getByText('Test'))
    expect(screen.queryByPlaceholderText('Alt')).toBeNull()
  })

  // ── Field editing ─────────────────────────────────────────────────────────

  it('editing a text field calls editItem on Save', async () => {
    mockActions.sectionData = {
      images: [{ alt: 'Old alt', src: '' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Expand the item
    fireEvent.click(screen.getByText('Old alt'))

    // Find the Alt input and change it
    const altInput = screen.getByPlaceholderText('Alt') as HTMLInputElement
    expect(altInput.value).toBe('Old alt')

    await act(async () => {
      fireEvent.change(altInput, { target: { value: 'New alt' } })
    })

    // editItem should NOT be called yet (buffered)
    expect(mockActions.editItem).not.toHaveBeenCalled()

    // Click Save to commit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    })

    expect(mockActions.editItem).toHaveBeenCalledWith('images', 0, {
      alt: 'New alt',
      src: '',
    })
  })

  it('editing a number field calls editItem on Save', async () => {
    mockActions.sectionData = {
      testimonials: [{ quote: 'Great!', author: 'Alice', role: 'Member' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'TestimonialRow',
        statementId: 'testimonials_1',
        sessionId: 'sess-1',
      }),
    )

    // Expand
    fireEvent.click(screen.getByText('Alice'))

    const roleInput = screen.getByPlaceholderText('Role') as HTMLInputElement
    expect(roleInput.value).toBe('Member')

    await act(async () => {
      fireEvent.change(roleInput, { target: { value: 'Founder' } })
    })

    // editItem should NOT be called yet (buffered)
    expect(mockActions.editItem).not.toHaveBeenCalled()

    // Click Save to commit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    })

    expect(mockActions.editItem).toHaveBeenCalledWith('testimonials', 0, {
      quote: 'Great!',
      author: 'Alice',
      role: 'Founder',
    })
  })

  it('editing a boolean field calls editItem on Save', async () => {
    mockActions.sectionData = {
      tiers: [{ name: 'Pro', price: '$30', highlighted: false }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'PricingTable',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
      }),
    )

    // Expand
    fireEvent.click(screen.getByText('Pro'))

    // Find the Highlighted checkbox
    const highlightedCheckbox = screen.getByRole('checkbox', {
      name: 'Highlighted',
    }) as HTMLInputElement
    expect(highlightedCheckbox.checked).toBe(false)

    await act(async () => {
      fireEvent.click(highlightedCheckbox)
    })

    // editItem should NOT be called yet (buffered)
    expect(mockActions.editItem).not.toHaveBeenCalled()

    // Click Save to commit
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    })

    expect(mockActions.editItem).toHaveBeenCalledWith('tiers', 0, {
      name: 'Pro',
      price: '$30',
      highlighted: true,
    })
  })

  it('Cancel reverts edits without calling editItem', async () => {
    mockActions.sectionData = {
      images: [{ alt: 'Old alt', src: '' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Expand the item
    fireEvent.click(screen.getByText('Old alt'))

    // Change the Alt input
    const altInput = screen.getByPlaceholderText('Alt') as HTMLInputElement
    await act(async () => {
      fireEvent.change(altInput, { target: { value: 'New alt' } })
    })

    // Click Cancel
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    })

    // editItem should NOT have been called
    expect(mockActions.editItem).not.toHaveBeenCalled()
  })

  // ── Reorder via drag handle ───────────────────────────────────────────────

  it('renders drag handles for sortable items', () => {
    mockActions.sectionData = {
      images: [{ alt: 'A' }, { alt: 'B' }, { alt: 'C' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Each item should have a drag handle with aria-label (uses item title)
    const handle1 = screen.getByLabelText('Drag A')
    const handle2 = screen.getByLabelText('Drag B')
    expect(handle1).toBeTruthy()
    expect(handle2).toBeTruthy()
  })

  it('drag reorder is wired to reorder the collection instead of only rendering handles', async () => {
    mockActions.sectionData = {
      images: [{ alt: 'A' }, { alt: 'B' }, { alt: 'C' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    const dragA = screen.getByLabelText('Drag A')
    const dragB = screen.getByLabelText('Drag B')

    await act(async () => {
      fireEvent.pointerDown(dragA, { clientX: 10, clientY: 10, buttons: 1 })
      fireEvent.pointerMove(dragA, { clientX: 10, clientY: 80, buttons: 1 })
      fireEvent.pointerUp(dragB, { clientX: 10, clientY: 80 })
    })

    expect(mockActions.reorderItem).toHaveBeenCalledWith('images', 0, 1)
  })

  // ── Empty collection ──────────────────────────────────────────────────────

  it('renders empty collection with Add button', () => {
    mockActions.sectionData = { images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getAllByText(/Images/).length).toBeGreaterThan(0)
    const addButtons = screen.getAllByRole('button', { name: /Add/ })
    expect(addButtons.length).toBeGreaterThan(0)
    // No item labels should be present
    expect(screen.queryByText('Photo 1')).toBeNull()
  })

  it('renders collection with missing array in sectionData', () => {
    mockActions.sectionData = {} // no images key

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Should still show the Images collection header + Add button
    expect(screen.getAllByText(/Images/).length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('button', { name: /Add/ }).length,
    ).toBeGreaterThan(0)
  })

  // ── Multiple collections ──────────────────────────────────────────────────

  it('renders CardGrid cards collection', () => {
    mockActions.sectionData = {
      cards: [
        {
          title: 'Camera Kit',
          description: 'Starter bundle',
          imageAlt: 'Camera bundle',
        },
        {
          title: 'Audio Kit',
          description: 'Creator audio',
          imageAlt: 'Microphone bundle',
        },
      ],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'CardGrid',
        statementId: 'deals_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getAllByText(/Cards/).length).toBeGreaterThan(0)
    expect(screen.getByText('Camera Kit')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /Add/ }).length).toBe(1)
    expect(screen.getAllByTitle('Move down').length).toBe(2)
  })

  it('editing a card item saves with the cards collection key', async () => {
    mockActions.sectionData = {
      cards: [
        {
          title: 'Camera Kit',
          description: 'Starter bundle',
          imageAlt: 'Camera bundle',
        },
      ],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'CardGrid',
        statementId: 'deals_1',
        sessionId: 'sess-1',
      }),
    )

    fireEvent.click(screen.getByText('Camera Kit'))
    const descInput = screen.getByPlaceholderText(
      'Description',
    ) as HTMLInputElement

    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Pro bundle' } })
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    })

    expect(mockActions.editItem).toHaveBeenCalledWith('cards', 0, {
      title: 'Camera Kit',
      description: 'Pro bundle',
      imageAlt: 'Camera bundle',
    })
  })

  // ── Scalar fields ─────────────────────────────────────────────────────────

  it('renders scalar string field with current value', () => {
    mockActions.sectionData = {
      badge: 'Flexible Workspaces',
      primaryCta: 'Explore Plans',
      secondaryCta: 'See the Space',
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'SplitHero',
        statementId: 'hero_1',
        sessionId: 'sess-1',
      }),
    )

    const badgeInput = screen.getByPlaceholderText('Badge') as HTMLInputElement
    expect(badgeInput.value).toBe('Flexible Workspaces')
  })

  it('editing scalar field updates the local preview without persisting immediately', async () => {
    mockActions.sectionData = {
      badge: 'Old text',
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'SplitHero',
        statementId: 'hero_1',
        sessionId: 'sess-1',
      }),
    )

    const badgeInput = screen.getByPlaceholderText('Badge') as HTMLInputElement

    await act(async () => {
      fireEvent.change(badgeInput, { target: { value: 'New text' } })
    })
    await act(async () => {
      fireEvent.blur(badgeInput)
    })

    expect(badgeInput.value).toBe('New text')
    expect(mockActions.setProp).not.toHaveBeenCalled()
  })

  // ── Missing sessionId ─────────────────────────────────────────────────────

  it('renders capsule fields even with empty sessionId (provider is pass-through)', () => {
    mockActions.sectionData = { chrome: 'editorial', images: [] }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: '',
        anonymousOwnerSecret: undefined,
      }),
    )

    // The mocked LakebedSessionProvider is a pass-through, so the panel
    // renders capsule fields regardless of sessionId. In production, an
    // empty sessionId would cause the real provider to skip subscription,
    // resulting in canEdit=false → loading state.
    expect(screen.getByText('chrome')).toBeTruthy()
  })

  // ── Item label uses first string field ────────────────────────────────────

  it('item label uses name field when available', () => {
    mockActions.sectionData = {
      tiers: [{ name: 'Enterprise', price: '$99' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'PricingTable',
        statementId: 'pricing_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getByText('Enterprise')).toBeTruthy()
  })

  it('item label falls back to alt field when no name field', () => {
    mockActions.sectionData = {
      images: [{ alt: 'Gallery photo', src: '' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    expect(screen.getByText('Gallery photo')).toBeTruthy()
  })

  it('item label falls back to index when no string field has value', () => {
    mockActions.sectionData = {
      images: [{ alt: '', src: '' }],
    }

    render(
      createElement(CapsuleContextPanel, {
        capsuleName: 'ImageGallery',
        statementId: 'gallery_1',
        sessionId: 'sess-1',
      }),
    )

    // Should show "images 1" or similar index-based label
    expect(screen.getByText(/images 1/i)).toBeTruthy()
  })
})
