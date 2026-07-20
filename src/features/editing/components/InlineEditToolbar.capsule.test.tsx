// @vitest-environment jsdom
//
// Integration tests for the capsule context panel wired into InlineEditToolbar.
// These verify the full chain: element selection → capsule detection →
// button visibility → panel open/close → panel renders correct capsule fields.
//
// If any link in this chain breaks (selector change, prop rename, panel
// import path, lakebed key format, etc.) these tests will catch it.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'

// --- Mocks ------------------------------------------------------------------

// Mock the lakebed hooks so CapsuleContextPanel renders without a real
// LakebedSessionProvider / Convex backend.
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

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children?: ReactNode }) =>
    createElement('div', { 'data-testid': 'provider' }, children),
}))

vi.mock('@ship-fast/lakebed/server', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/server')>()
  return { ...actual }
})

// convex/react — no-op for the toolbar's own use
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(async () => undefined),
  useQuery: vi.fn(() => undefined),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      generateImageUploadUrl: 'generateImageUploadUrl',
      saveUserImage: 'saveUserImage',
      listUserImages: 'listUserImages',
    },
  },
}))

vi.mock('@/lib/stock-image', () => ({
  searchStockImages: vi.fn(async () => []),
  buildBackgroundImageUrl: (
    r: { baseUrl?: string; imageUrl?: string },
    res: string,
  ) => (r.baseUrl ? `${r.baseUrl}?res=${res}` : r.imageUrl),
}))
vi.mock('@/lib/image-context', () => ({
  generateContextAwareQuery: vi.fn((alt: string) => alt),
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))

// @floating-ui/react — fixed position for jsdom
vi.mock('@floating-ui/react', () => ({
  useFloating: () => ({
    refs: { setFloating: () => {}, setPositionReference: () => {} },
    floatingStyles: { position: 'fixed', top: '0px', left: '0px' },
    update: vi.fn(),
  }),
  offset: () => ({}),
  shift: () => ({}),
  autoUpdate: () => () => {},
  flip: () => ({}),
  arrow: () => ({}),
  hide: () => ({}),
  inline: () => ({}),
  limitShift: () => ({}),
}))

// Radix AlertDialog → controlled, jsdom-friendly
vi.mock('#/components/ui/alert-dialog', () => {
  const React = require('react') as typeof import('react')
  const Ctx = React.createContext<{
    open: boolean
    setOpen: (b: boolean) => void
  }>({
    open: false,
    setOpen: () => {},
  })
  const AlertDialog = ({
    children,
    open,
    onOpenChange,
  }: {
    children?: ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }) =>
    React.createElement(
      Ctx.Provider,
      { value: { open: open ?? false, setOpen: onOpenChange ?? (() => {}) } },
      children,
    )
  const AlertDialogTrigger = ({ children }: { children?: ReactNode }) =>
    React.createElement('button', { type: 'button' }, children)
  const AlertDialogContent = ({ children }: { children?: ReactNode }) => {
    const { open } = React.useContext(Ctx)
    return open
      ? React.createElement('div', { role: 'alertdialog' }, children)
      : null
  }
  const AlertDialogHeader = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogFooter = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogTitle = ({ children }: { children?: ReactNode }) =>
    React.createElement('h2', null, children)
  const AlertDialogDescription = ({ children }: { children?: ReactNode }) =>
    React.createElement('p', null, children)
  const AlertDialogCancel = ({ children }: { children?: ReactNode }) =>
    React.createElement('button', { type: 'button' }, children)
  const AlertDialogAction = ({
    children,
    onClick,
  }: {
    children?: ReactNode
    onClick?: () => void
  }) => React.createElement('button', { type: 'button', onClick }, children)
  return {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
  }
})

// Radix Select → native select
vi.mock('#/components/ui/select', () => {
  const React = require('react') as typeof import('react')
  const SelectContent = ({ children }: { children?: ReactNode }) => children
  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value?: string
    onValueChange?: (v: string) => void
    children?: ReactNode
  }) =>
    React.createElement(
      'select',
      {
        value,
        onChange: (e: { target: { value: string } }) =>
          onValueChange?.(e.target.value),
      },
      children,
    )
  const SelectTrigger = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children)
  const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    React.createElement('span', null, placeholder)
  const SelectItem = ({
    value,
    children,
  }: {
    value?: string
    children?: ReactNode
  }) => React.createElement('option', { value }, children)
  const SelectGroup = ({ children }: { children?: ReactNode }) => children
  const SelectLabel = ({ children }: { children?: ReactNode }) => children
  const SelectScrollUpButton = () => null
  const SelectScrollDownButton = () => null
  return {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectScrollUpButton,
    SelectScrollDownButton,
  }
})

// Radix ToggleGroup → native buttons
vi.mock('#/components/ui/toggle-group', () => {
  const React = require('react') as typeof import('react')
  const ToggleGroupContext = React.createContext<{
    value: string | undefined
    onValueChange: ((v: string) => void) | undefined
  }>({ value: undefined, onValueChange: undefined })
  const ToggleGroup = ({
    value,
    onValueChange,
    children,
  }: {
    value?: string
    onValueChange?: (v: string) => void
    children?: ReactNode
  }) =>
    React.createElement(
      ToggleGroupContext.Provider,
      { value: { value, onValueChange } },
      children,
    )
  const ToggleGroupItem = ({
    value,
    children,
    pressed,
  }: {
    value?: string
    children?: ReactNode
    pressed?: boolean
  }) =>
    React.createElement(
      'button',
      { type: 'button', 'data-value': value, 'aria-pressed': pressed },
      children,
    )
  return { ToggleGroup, ToggleGroupItem }
})

vi.mock('#/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children?: ReactNode }) => children,
  TooltipTrigger: ({ children }: { children?: ReactNode }) => children,
  TooltipContent: ({ children }: { children?: ReactNode }) =>
    createElement('span', { 'data-testid': 'tooltip' }, children),
  TooltipProvider: ({ children }: { children?: ReactNode }) => children,
}))

vi.mock('#/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: {
    children?: ReactNode
    [key: string]: unknown
  }) => createElement('button', props, children),
}))

vi.mock('#/components/ui/input-group', () => ({
  InputGroup: ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children),
  InputGroupAddon: ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children),
  InputGroupInput: (props: Record<string, unknown>) =>
    createElement('input', props),
  InputGroupText: ({ children }: { children?: ReactNode }) =>
    createElement('span', null, children),
}))

vi.mock('#/components/ui/popover', () => ({
  Popover: ({ children }: { children?: ReactNode }) => children,
  PopoverTrigger: ({ children }: { children?: ReactNode }) => children,
  PopoverContent: ({ children }: { children?: ReactNode }) =>
    createElement('div', null, children),
  PopoverAnchor: ({ children }: { children?: ReactNode }) => children,
}))

vi.mock('#/components/ui/separator', () => ({
  Separator: () => createElement('hr'),
}))

// StyleControlsPanel, TypographyControlsPanel, etc. — stub to keep tests fast
vi.mock('./StyleControlsPanel', () => ({
  StyleControlsPanel: () =>
    createElement('div', { 'data-testid': 'style-panel' }),
}))
vi.mock('./TypographyControlsPanel', () => ({
  TypographyControlsPanel: () =>
    createElement('div', { 'data-testid': 'typography-panel' }),
}))
vi.mock('./LinkEditPopover', () => ({
  LinkEditPopover: () => createElement('div', { 'data-testid': 'link-panel' }),
}))
vi.mock('./ImageSwapPanel', () => ({
  ImageSwapPanel: () => createElement('div', { 'data-testid': 'image-panel' }),
}))

// --- Test helpers -----------------------------------------------------------

const anchorRect = new DOMRect(100, 100, 200, 40)

/** Create a capsule section element with data-openui-component and data-openui-var. */
function makeCapsuleSectionEl(
  componentName: string,
  varName: string,
  tag = 'section',
): HTMLElement {
  const el = document.createElement(tag)
  el.setAttribute('data-openui-component', componentName)
  el.setAttribute('data-openui-var', varName)
  el.textContent = `${componentName} content`
  document.body.appendChild(el)
  return el
}

/** Create a child element INSIDE a capsule section (simulates clicking a heading inside a section). */
function makeChildInsideCapsule(
  componentName: string,
  varName: string,
  childTag = 'h2',
): HTMLElement {
  const section = makeCapsuleSectionEl(componentName, varName)
  const child = document.createElement(childTag)
  child.textContent = 'Child heading'
  section.appendChild(child)
  return child
}

function renderToolbar(opts: {
  activeElement: HTMLElement | null
  isOpen?: boolean
  anchorRect?: DOMRect | null
  sessionId?: string
  anonymousOwnerSecret?: string
}) {
  return render(
    createElement(InlineEditToolbar, {
      isOpen: opts.isOpen ?? true,
      anchorRect: opts.anchorRect ?? anchorRect,
      activeElement: opts.activeElement,
      onStyleApply: vi.fn(),
      onCommitText: vi.fn(),
      onClose: vi.fn(),
      isApplying: false,
      isForking: false,
      canUndo: true,
      canRedo: true,
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onMoveUp: vi.fn(),
      onMoveDown: vi.fn(),
      canMoveUp: true,
      canMoveDown: true,
      onLinkEdit: vi.fn(),
      onImageSelect: vi.fn(),
      sessionId: opts.sessionId,
      anonymousOwnerSecret: opts.anonymousOwnerSecret,
      onSectionEdit: vi.fn(),
      isSectionSubmitting: false,
    }),
  )
}

// Import AFTER all mocks are set up
import { InlineEditToolbar } from './InlineEditToolbar'

// --- Tests ------------------------------------------------------------------

describe('InlineEditToolbar — capsule context panel integration', () => {
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

  // ── Button visibility ────────────────────────────────────────────────────

  describe('Capsule controls button visibility', () => {
    it('opens from a closed render without changing hook order', () => {
      const child = makeChildInsideCapsule('CoworkingPricing', 'home_pricing')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)

      try {
        const view = renderToolbar({
          activeElement: null,
          anchorRect: null,
          isOpen: false,
          sessionId: 'sess-1',
        })

        view.rerender(
          createElement(InlineEditToolbar, {
            isOpen: true,
            anchorRect,
            activeElement: child,
            onStyleApply: vi.fn(),
            onCommitText: vi.fn(),
            onClose: vi.fn(),
            isApplying: false,
            isForking: false,
            canUndo: true,
            canRedo: true,
            onUndo: vi.fn(),
            onRedo: vi.fn(),
            onMoveUp: vi.fn(),
            onMoveDown: vi.fn(),
            canMoveUp: true,
            canMoveDown: true,
            onLinkEdit: vi.fn(),
            onImageSelect: vi.fn(),
            sessionId: 'sess-1',
            onSectionEdit: vi.fn(),
            isSectionSubmitting: false,
          }),
        )

        expect(
          screen.getByRole('button', { name: 'Capsule controls' }),
        ).toBeTruthy()
        expect(
          consoleError.mock.calls.some((call) =>
            call.some((arg) =>
              String(arg).includes(
                'Rendered more hooks than during the previous render',
              ),
            ),
          ),
        ).toBe(false)
      } finally {
        consoleError.mockRestore()
      }
    })

    it('shows the button when activeElement is inside a capsule section', () => {
      const child = makeChildInsideCapsule('CoworkingPricing', 'home_pricing')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      expect(
        screen.getByRole('button', { name: 'Capsule controls' }),
      ).toBeTruthy()
    })

    it('shows the button when activeElement IS the capsule section element', () => {
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(
        screen.getByRole('button', { name: 'Capsule controls' }),
      ).toBeTruthy()
    })

    it('does NOT show the button for the Stack capsule (page root)', () => {
      const section = makeCapsuleSectionEl('Stack', 'home_stack')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('does NOT show the button for Navbar capsules (not realtime-editable)', () => {
      const section = makeCapsuleSectionEl('CoworkingNavbar', 'home_navbar')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('does NOT show the button for Footer capsules (not realtime-editable)', () => {
      const section = makeCapsuleSectionEl('CoworkingFooter', 'home_footer')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('does NOT show the button when sessionId is missing', () => {
      const section = makeCapsuleSectionEl('CoworkingPricing', 'home_pricing')
      renderToolbar({ activeElement: section })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('does NOT show the button when element has no capsule ancestor', () => {
      const el = document.createElement('p')
      el.textContent = 'Standalone text'
      document.body.appendChild(el)
      renderToolbar({ activeElement: el, sessionId: 'sess-1' })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('does NOT show the button when data-openui-var is missing', () => {
      const section = document.createElement('section')
      section.setAttribute('data-openui-component', 'CoworkingPricing')
      // No data-openui-var
      section.textContent = 'Pricing'
      document.body.appendChild(section)
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })

    it('finds capsule via closest() when clicking a deeply nested child', () => {
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      // Create a deeply nested child: section > div > div > span
      const div1 = document.createElement('div')
      const div2 = document.createElement('div')
      const span = document.createElement('span')
      span.textContent = 'Deep text'
      div2.appendChild(span)
      div1.appendChild(div2)
      section.appendChild(div1)

      renderToolbar({ activeElement: span, sessionId: 'sess-1' })

      expect(
        screen.getByRole('button', { name: 'Capsule controls' }),
      ).toBeTruthy()
    })
  })

  // ── Panel open/close ──────────────────────────────────────────────────────

  describe('Capsule panel open/close', () => {
    it('clicking the button opens the capsule panel', () => {
      mockActions.sectionData = { columns: 3, images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      const btn = screen.getByRole('button', { name: 'Capsule controls' })
      expect(btn.getAttribute('aria-expanded')).toBe('false')

      fireEvent.click(btn)

      expect(btn.getAttribute('aria-expanded')).toBe('true')
      // Panel should render capsule fields (columns variant label)
      expect(screen.getByText('columns')).toBeTruthy()
    })

    it('clicking the button again closes the capsule panel', () => {
      mockActions.sectionData = { columns: 3, images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      const btn = screen.getByRole('button', { name: 'Capsule controls' })
      fireEvent.click(btn)
      expect(btn.getAttribute('aria-expanded')).toBe('true')

      fireEvent.click(btn)
      expect(btn.getAttribute('aria-expanded')).toBe('false')
    })

    it('opening capsule panel closes other panels (AI edit)', () => {
      mockActions.sectionData = { columns: 3, images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      // Open AI edit panel first
      const aiBtn = screen.getByRole('button', { name: 'AI edit' })
      fireEvent.click(aiBtn)
      expect(aiBtn.getAttribute('aria-expanded')).toBe('true')

      // Open capsule panel — AI should close
      const capsuleBtn = screen.getByRole('button', {
        name: 'Capsule controls',
      })
      fireEvent.click(capsuleBtn)
      expect(capsuleBtn.getAttribute('aria-expanded')).toBe('true')
      expect(aiBtn.getAttribute('aria-expanded')).toBe('false')
    })
  })

  // ── Panel renders correct capsule fields ─────────────────────────────────

  describe('Panel renders correct capsule schema', () => {
    it('renders CoworkingPricing tiers collection', () => {
      mockActions.sectionData = {
        tiers: [{ name: 'Basic', price: '$10' }],
      }
      const section = makeCapsuleSectionEl('CoworkingPricing', 'home_pricing')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))

      // Tiers collection label should be present
      expect(screen.getAllByText(/Tiers/).length).toBeGreaterThan(0)
      // The tier name should show as an item label
      expect(screen.getByText('Basic')).toBeTruthy()
    })

    it('renders CoworkingGallery columns variant + images collection', () => {
      mockActions.sectionData = {
        columns: 3,
        images: [{ alt: 'Photo' }],
      }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))

      // Variant label
      expect(screen.getByText('columns')).toBeTruthy()
      // Collection label
      expect(screen.getAllByText(/Images/).length).toBeGreaterThan(0)
    })

    it('renders CoworkingHero scalar fields', () => {
      mockActions.sectionData = {
        eyebrow: 'Flexible Workspaces',
        headingLead: 'Work',
      }
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))

      // Scalar field inputs should be present (placeholder-based labels)
      expect(screen.getByPlaceholderText('Eyebrow')).toBeTruthy()
      expect(screen.getByPlaceholderText('Heading Lead')).toBeTruthy()
    })

    it('hides Capsule controls button for unknown capsule name', () => {
      mockActions.sectionData = {}
      const section = makeCapsuleSectionEl('NonExistentCapsule', 'home_x')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      // Button should not appear — capsuleHasContext returns false
      expect(
        screen.queryByRole('button', { name: 'Capsule controls' }),
      ).toBeNull()
    })
  })

  // ── Panel interactions propagate to hook ─────────────────────────────────

  describe('Panel interactions call hook actions', () => {
    it('clicking variant option in Manage Section Content does not persist before Apply', () => {
      mockActions.sectionData = { columns: 2 }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      fireEvent.click(screen.getByRole('button', { name: '4' }))

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('closing Manage Section Content discards scalar edits without persisting', async () => {
      mockActions.sectionData = {
        eyebrow: 'Old eyebrow',
        headingLead: 'Work',
      }
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      const eyebrowInput = screen.getByPlaceholderText(
        'Eyebrow',
      ) as HTMLInputElement

      await act(async () => {
        fireEvent.change(eyebrowInput, { target: { value: 'New eyebrow' } })
      })
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('closing Manage Section Content discards reorder without persisting', () => {
      mockActions.sectionData = {
        images: [{ alt: 'A' }, { alt: 'B' }],
      }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      fireEvent.click(screen.getAllByTitle('Move down')[0]!)
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))

      expect(mockActions.reorderItem).not.toHaveBeenCalled()
    })

    it('pressing Escape discards Manage Section Content scalar edits without persisting', async () => {
      mockActions.sectionData = {
        eyebrow: 'Old eyebrow',
        headingLead: 'Work',
      }
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      const eyebrowInput = screen.getByPlaceholderText(
        'Eyebrow',
      ) as HTMLInputElement

      await act(async () => {
        fireEvent.change(eyebrowInput, { target: { value: 'Escape draft' } })
      })
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('clicking outside discards Manage Section Content scalar edits without persisting', async () => {
      mockActions.sectionData = {
        eyebrow: 'Old eyebrow',
        headingLead: 'Work',
      }
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      const eyebrowInput = screen.getByPlaceholderText(
        'Eyebrow',
      ) as HTMLInputElement

      await act(async () => {
        fireEvent.change(eyebrowInput, { target: { value: 'Outside draft' } })
      })
      fireEvent.mouseDown(document.body)

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('pressing Escape discards Manage Section Content reorder without persisting', () => {
      mockActions.sectionData = {
        images: [{ alt: 'A' }, { alt: 'B' }],
      }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      fireEvent.click(screen.getAllByTitle('Move down')[0]!)
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockActions.reorderItem).not.toHaveBeenCalled()
    })

    it('Manage Section Content scalar edits persist only after Apply', async () => {
      mockActions.sectionData = {
        eyebrow: 'Old eyebrow',
        headingLead: 'Work',
      }
      const section = makeCapsuleSectionEl('CoworkingHero', 'home_hero')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      const eyebrowInput = screen.getByPlaceholderText(
        'Eyebrow',
      ) as HTMLInputElement

      await act(async () => {
        fireEvent.change(eyebrowInput, { target: { value: 'Applied eyebrow' } })
      })
      expect(mockActions.setProp).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockActions.setProp).toHaveBeenCalledWith(
        'eyebrow',
        'Applied eyebrow',
      )
    })

    it('Manage Section Content variant changes persist only after Apply', () => {
      mockActions.sectionData = { columns: 2, images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      fireEvent.click(screen.getByRole('button', { name: '4' }))
      expect(mockActions.setProp).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockActions.setProp).toHaveBeenCalledWith('columns', 4)
    })

    it('clicking Add button calls addItem', async () => {
      mockActions.sectionData = { images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))
      // Click Add — shows inline draft form
      const addBtn = screen.getAllByRole('button', { name: /Add/ })[0]
      fireEvent.click(addBtn!)

      // Click Save in the inline draft
      const saveBtn = screen.getByRole('button', { name: /Save/ })
      await act(async () => {
        fireEvent.click(saveBtn)
      })

      expect(mockActions.addItem).toHaveBeenCalledWith('images', {
        alt: '',
        caption: '',
      })
    })

    it('opening remove confirmation does not persist before confirmation or Apply', async () => {
      mockActions.sectionData = {
        images: [{ alt: 'A' }, { alt: 'B' }],
      }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))

      const allButtons = screen.getAllByRole('button')
      const trashBtn = allButtons.find((b) =>
        b.className.includes('text-red-400'),
      )
      expect(trashBtn).toBeTruthy()

      await act(async () => {
        fireEvent.click(trashBtn!)
      })

      expect(mockActions.removeItem).not.toHaveBeenCalled()
    })
  })

  // ── Loading state ────────────────────────────────────────────────────────

  describe('Loading state', () => {
    it('shows loading text when canEdit is false', () => {
      mockActions.canEdit = false
      mockActions.sectionData = null
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: 'Capsule controls' }))

      expect(screen.getByText('Loading section data…')).toBeTruthy()
    })
  })

  // ── anonymousOwnerSecret passthrough ─────────────────────────────────────

  describe('anonymousOwnerSecret passthrough', () => {
    it('renders without error when anonymousOwnerSecret is provided', () => {
      mockActions.sectionData = { columns: 3, images: [] }
      const section = makeCapsuleSectionEl('CoworkingGallery', 'home_gallery')
      // Just verify it doesn't crash — the secret is consumed by
      // LakebedSessionProvider which is mocked as a pass-through.
      expect(() =>
        renderToolbar({
          activeElement: section,
          sessionId: 'sess-1',
          anonymousOwnerSecret: 'secret-123',
        }),
      ).not.toThrow()
    })
  })

  // ── Capsule inline controls (auto-open) ──────────────────────────────────

  describe('Capsule inline controls auto-open', () => {
    it('auto-opens the capsule-inline panel when element is inside a capsule', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      // The inline variant switcher should be visible without clicking
      // the "Capsule controls" button.
      expect(screen.getByText('columns')).toBeTruthy()
    })

    it('shows variant switcher buttons in the inline panel', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      expect(screen.getByRole('button', { name: '2' })).toBeTruthy()
      expect(screen.getByRole('button', { name: '3' })).toBeTruthy()
      expect(screen.getByRole('button', { name: '4' })).toBeTruthy()
    })

    it('shows collection Add button in the inline panel', () => {
      mockActions.sectionData = {
        features: [{ title: 'Hot Desks', description: 'Pick any desk' }],
      }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      expect(screen.getByRole('button', { name: /Add/ })).toBeTruthy()
    })

    it('inline panel variant changes wait for Apply before persisting', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: '4' }))
      expect(mockActions.setProp).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockActions.setProp).toHaveBeenCalledWith('columns', 4)
    })

    it('inline panel variant changes are discarded on Escape before Apply', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: '4' }))
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('inline panel variant changes are discarded on outside click before Apply', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: '4' }))
      fireEvent.mouseDown(document.body)

      expect(mockActions.setProp).not.toHaveBeenCalled()
    })

    it('inline panel Add waits for Apply before persisting a new collection item', () => {
      mockActions.sectionData = { features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      fireEvent.click(screen.getByRole('button', { name: /Add/ }))
      expect(mockActions.addItem).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockActions.addItem).toHaveBeenCalledWith('features', {
        title: '',
        description: '',
      })
    })

    it('does not auto-open inline panel for Navbar capsules', () => {
      mockActions.sectionData = {}
      const child = makeChildInsideCapsule('CoworkingNavbar', 'home_nav')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      // Navbar is excluded — no inline variant switcher should appear
      expect(screen.queryByText('columns')).toBeNull()
    })

    it('does not auto-open inline panel for Footer capsules', () => {
      mockActions.sectionData = {}
      const child = makeChildInsideCapsule('CoworkingFooter', 'home_footer')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      expect(screen.queryByText('columns')).toBeNull()
    })

    it('does not auto-open inline panel for Stack capsule', () => {
      const section = makeCapsuleSectionEl('Stack', 'page_root')
      renderToolbar({ activeElement: section, sessionId: 'sess-1' })

      expect(screen.queryByText('columns')).toBeNull()
    })

    it('still allows opening the full Capsule controls panel alongside inline', () => {
      mockActions.sectionData = { columns: 3, features: [] }
      const child = makeChildInsideCapsule('CoworkingFeatures', 'home_features')
      renderToolbar({ activeElement: child, sessionId: 'sess-1' })

      // The "Capsule controls" button should still be present
      expect(
        screen.getByRole('button', { name: 'Capsule controls' }),
      ).toBeTruthy()
    })
  })
})
