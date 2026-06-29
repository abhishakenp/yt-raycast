// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom lacks ResizeObserver / IntersectionObserver — provide stubs.
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}
if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    },
    writable: true,
  })
}
// jsdom does not implement CSS.escape (used by handleApply/handleDelete).
if (
  !('CSS' in globalThis) ||
  typeof (globalThis as { CSS?: { escape?: unknown } }).CSS?.escape !==
    'function'
) {
  const cssShim: { escape: (s: string) => string } = {
    escape: (s: string) =>
      String(s).replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`),
  }
  ;(globalThis as { CSS?: { escape?: unknown } }).CSS = {
    ...((globalThis as { CSS?: { escape?: unknown } }).CSS ?? {}),
    ...cssShim,
  }
}

// --- Mocks -----------------------------------------------------------------

// convex/react is used by the image/background panels. Provide no-op hooks.
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(async () => undefined),
  useQuery: () => undefined,
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
}))
vi.mock('@/lib/image-context', () => ({
  generateContextAwareQuery: vi.fn((alt: string) => alt),
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))

// @floating-ui/react: return a fixed position so jsdom doesn't choke on
// autoUpdate/middleware. Refs are no-ops.
vi.mock('@floating-ui/react', () => ({
  useFloating: () => ({
    refs: { setFloating: () => {}, setPositionReference: () => {} },
    floatingStyles: { position: 'fixed', top: '0px', left: '0px' },
  }),
  autoUpdate: () => () => {},
  offset: () => ({}),
  shift: () => ({}),
}))

// Radix AlertDialog → controlled, jsdom-friendly implementation.
vi.mock('#/components/ui/alert-dialog', () => {
  const React = require('react') as typeof import('react')
  const Ctx = React.createContext<{
    open: boolean
    setOpen: (b: boolean) => void
  }>({ open: false, setOpen: () => {} })
  const AlertDialog = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    return React.createElement(
      Ctx.Provider,
      { value: { open, setOpen } },
      children,
    )
  }
  const AlertDialogTrigger = ({
    children,
    asChild: _asChild,
    ...rest
  }: {
    children: React.ReactElement
    asChild?: boolean
  } & Record<string, unknown>) => {
    const ctx = React.useContext(Ctx)
    const child = React.Children.only(children) as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void
    }>
    return React.cloneElement(child, {
      ...rest,
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        ctx.setOpen(true)
      },
    })
  }
  const AlertDialogContent = ({ children }: { children: React.ReactNode }) => {
    const ctx = React.useContext(Ctx)
    if (!ctx.open) return null
    return React.createElement(
      'div',
      { role: 'alertdialog', 'data-testid': 'alert-dialog-content' },
      children,
    )
  }
  const AlertDialogPortal = ({ children }: { children: React.ReactNode }) =>
    children
  const AlertDialogHeader = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogTitle = ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', null, children)
  const AlertDialogDescription = ({
    children,
  }: {
    children: React.ReactNode
  }) => React.createElement('p', null, children)
  const AlertDialogFooter = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogCancel = ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
  } & Record<string, unknown>) => {
    const ctx = React.useContext(Ctx)
    return React.createElement(
      'button',
      {
        ...rest,
        onClick: (e: React.MouseEvent) => {
          onClick?.(e)
          ctx.setOpen(false)
        },
      },
      children,
    )
  }
  const AlertDialogAction = ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
  } & Record<string, unknown>) => {
    const ctx = React.useContext(Ctx)
    return React.createElement(
      'button',
      {
        ...rest,
        onClick: (e: React.MouseEvent) => {
          onClick?.(e)
          ctx.setOpen(false)
        },
      },
      children,
    )
  }
  return {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogPortal,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
  }
})

// Radix Select → native <select> so panel dropdowns are jsdom-interactable.
vi.mock('#/components/ui/select', () => {
  const React = require('react') as typeof import('react')
  const SelectContent = ({ children }: { children: React.ReactNode }) =>
    children
  const Select = ({
    value,
    defaultValue,
    onValueChange,
    children,
    ...rest
  }: {
    value?: string
    defaultValue?: string
    onValueChange?: (v: string) => void
    children: React.ReactNode
  } & Record<string, unknown>) => {
    const content = React.Children.toArray(children).find(
      (c: React.ReactNode) =>
        React.isValidElement(c) &&
        (c as React.ReactElement).type === SelectContent,
    )
    return React.createElement(
      'select',
      {
        ...rest,
        value: value ?? defaultValue ?? '',
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(e.target.value),
      },
      content,
    )
  }
  const SelectTrigger = () => null
  const SelectValue = () => null
  const SelectItem = ({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) => React.createElement('option', { value }, children)
  const SelectGroup = ({ children }: { children: React.ReactNode }) => children
  const SelectLabel = ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children)
  const SelectSeparator = () => null
  const SelectScrollUpButton = () => null
  const SelectScrollDownButton = () => null
  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
  }
})

// Radix ToggleGroup → native buttons (jsdom-friendly).
vi.mock('#/components/ui/toggle-group', () => {
  const React = require('react') as typeof import('react')
  const ToggleGroup = ({
    children,
    ...rest
  }: { children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement('div', { ...rest, role: 'group' }, children)
  const ToggleGroupItem = ({
    value,
    children,
    ...rest
  }: {
    value: string
    children: React.ReactNode
  } & Record<string, unknown>) =>
    React.createElement('button', { ...rest, type: 'button', value }, children)
  return { ToggleGroup, ToggleGroupItem }
})

// --- Fake computed style returned for any element --------------------------
// dom-accessibility-api (used by RTL getByRole) calls `.getPropertyValue`,
// so the fake must implement it in addition to exposing style props directly.
const fakeComputedStyle = {
  fontSize: '16px',
  fontWeight: '400',
  fontStyle: 'normal',
  textDecorationLine: 'none',
  textDecoration: 'none',
  color: 'rgb(255,255,255)',
  textAlign: 'left',
  borderTopWidth: '0px',
  borderBottomWidth: '0px',
  borderLeftWidth: '0px',
  borderRightWidth: '0px',
  borderStyle: 'none',
  borderColor: 'rgb(0,0,0)',
  borderRadius: '0px',
  display: 'block',
  visibility: 'visible',
  getPropertyValue(prop: string) {
    return (this as Record<string, unknown>)[prop] ?? ''
  },
}

const anchorRect = {
  top: 100,
  bottom: 140,
  left: 10,
  right: 110,
  width: 100,
  height: 40,
  x: 10,
  y: 100,
} as unknown as DOMRect

// Fresh import per test so the module-level `copiedStyle` clipboard resets.
let InlineEditToolbar: typeof import('./InlineEditToolbar').InlineEditToolbar
let originalRaf: typeof globalThis.requestAnimationFrame

beforeEach(async () => {
  vi.resetModules()
  ;({ InlineEditToolbar } = await import('./InlineEditToolbar'))
  vi.spyOn(window, 'getComputedStyle').mockReturnValue(
    fakeComputedStyle as unknown as CSSStyleDeclaration,
  )
  originalRaf = globalThis.requestAnimationFrame
  // Run rAF callbacks synchronously so styleReadCompleteRef flips immediately.
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0)
    return 0
  }) as typeof requestAnimationFrame
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  globalThis.requestAnimationFrame = originalRaf
  document.body.innerHTML = ''
})

// --- Helpers ---------------------------------------------------------------

function makeTextEl() {
  const el = document.createElement('p')
  el.className = 'hero-title'
  el.textContent = 'Hello world'
  document.body.appendChild(el)
  return el
}

function makeLinkEl() {
  const el = document.createElement('a')
  el.className = 'cta-link'
  el.setAttribute('href', 'https://example.com')
  el.textContent = 'Click here'
  document.body.appendChild(el)
  return el
}

function makeImageEl() {
  const el = document.createElement('img')
  el.className = 'hero-img'
  el.setAttribute('src', 'https://example.com/orig.png')
  el.setAttribute('alt', 'Hero')
  document.body.appendChild(el)
  return el
}

// The active visual class applied to toggled buttons in the real component.
const ACTIVE_CLASS = 'bg-cyan-300/20'

function isActive(btn: HTMLElement): boolean {
  return btn.className.includes(ACTIVE_CLASS)
}

interface RenderOpts {
  activeElement?: HTMLElement
  isApplying?: boolean
  isForking?: boolean
  canUndo?: boolean
  canRedo?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  sessionId?: string
}

function renderToolbar(opts: RenderOpts = {}) {
  const activeElement = opts.activeElement ?? makeTextEl()
  const onStyleApply = vi.fn()
  const onCommitText = vi.fn()
  const onClose = vi.fn()
  const onUndo = vi.fn()
  const onRedo = vi.fn()
  const onMoveUp = vi.fn()
  const onMoveDown = vi.fn()
  const onLinkEdit = vi.fn()
  const onImageSelect = vi.fn()
  const utils = render(
    createElement(InlineEditToolbar, {
      isOpen: true,
      anchorRect,
      activeElement,
      onStyleApply,
      onCommitText,
      onClose,
      isApplying: opts.isApplying ?? false,
      isForking: opts.isForking ?? false,
      canUndo: opts.canUndo ?? true,
      canRedo: opts.canRedo ?? true,
      onUndo,
      onRedo,
      onMoveUp,
      onMoveDown,
      canMoveUp: opts.canMoveUp ?? true,
      canMoveDown: opts.canMoveDown ?? true,
      onLinkEdit,
      onImageSelect,
      sessionId: opts.sessionId,
    }),
  )
  return {
    ...utils,
    activeElement,
    onStyleApply,
    onCommitText,
    onClose,
    onUndo,
    onRedo,
    onMoveUp,
    onMoveDown,
    onLinkEdit,
    onImageSelect,
  }
}

describe('InlineEditToolbar (behavioral)', () => {
  // 1. Bold toggle: click → active state visible; click again → inactive.
  // Asserts the visual state CHANGED (not just that it has a class).
  it('1. bold toggle: click → active, click again → inactive', () => {
    const { container } = renderToolbar()
    const bold = screen.getByRole('button', { name: 'Bold' })
    expect(isActive(bold)).toBe(false)
    fireEvent.click(bold)
    expect(isActive(bold)).toBe(true)
    fireEvent.click(bold)
    expect(isActive(bold)).toBe(false)
    // sanity: button rendered inside toolbar
    expect(container.querySelector('[data-inline-edit-wrapper]')).not.toBeNull()
  })

  // 2. Italic toggle: same
  it('2. italic toggle: click → active, click again → inactive', () => {
    renderToolbar()
    const italic = screen.getByRole('button', { name: 'Italic' })
    expect(isActive(italic)).toBe(false)
    fireEvent.click(italic)
    expect(isActive(italic)).toBe(true)
    fireEvent.click(italic)
    expect(isActive(italic)).toBe(false)
  })

  // 3. Underline toggle: same
  it('3. underline toggle: click → active, click again → inactive', () => {
    renderToolbar()
    const underline = screen.getByRole('button', { name: 'Underline' })
    expect(isActive(underline)).toBe(false)
    fireEvent.click(underline)
    expect(isActive(underline)).toBe(true)
    fireEvent.click(underline)
    expect(isActive(underline)).toBe(false)
  })

  // 4. Strikethrough toggle: same
  it('4. strikethrough toggle: click → active, click again → inactive', () => {
    renderToolbar()
    const strike = screen.getByRole('button', { name: 'Strikethrough' })
    expect(isActive(strike)).toBe(false)
    fireEvent.click(strike)
    expect(isActive(strike)).toBe(true)
    fireEvent.click(strike)
    expect(isActive(strike)).toBe(false)
  })

  // 5. Text alignment: click center → center active, left inactive
  // (radio behavior — only one active at a time)
  it('5. alignment: left → center → right toggles exclusively', () => {
    renderToolbar()
    const left = screen.getByRole('button', { name: 'Align left' })
    const center = screen.getByRole('button', { name: 'Align center' })
    const right = screen.getByRole('button', { name: 'Align right' })
    fireEvent.click(left)
    expect(isActive(left)).toBe(true)
    expect(isActive(center)).toBe(false)
    fireEvent.click(center)
    expect(isActive(left)).toBe(false)
    expect(isActive(center)).toBe(true)
    fireEvent.click(right)
    expect(isActive(center)).toBe(false)
    expect(isActive(right)).toBe(true)
  })

  // 6. Font size: type "24" → input value is "24"
  it('6. font size input updates value; unit selector updates', () => {
    const { container } = renderToolbar()
    const numberInput = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement
    expect(numberInput).not.toBeNull()
    fireEvent.change(numberInput, { target: { value: '24' } })
    expect(numberInput.value).toBe('24')
    const unitSelect = container.querySelector('select') as HTMLSelectElement
    expect(unitSelect).not.toBeNull()
    fireEvent.change(unitSelect, { target: { value: 'em' } })
    expect(unitSelect.value).toBe('em')
  })

  // 7. Font weight: select "700" → value updates
  it('7. font weight: change to 700 → value updates', () => {
    const { container } = renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Typography controls' }))
    // Find the select that has an option with value "700" (the weight control).
    const selects = Array.from(
      container.querySelectorAll('select'),
    ) as HTMLSelectElement[]
    const weightSelect = selects.find((s) =>
      Array.from(s.options).some((o) => o.value === '700'),
    )
    expect(weightSelect).toBeTruthy()
    fireEvent.change(weightSelect!, { target: { value: '700' } })
    expect(weightSelect!.value).toBe('700')
  })

  // 8. Color picker: change color → value updates
  it('8. color picker: change → value updates', () => {
    const { container } = renderToolbar()
    const color = container.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    expect(color).not.toBeNull()
    fireEvent.change(color, { target: { value: '#ff0000' } })
    expect(color.value).toBe('#ff0000')
  })

  // 9. Copy style: click copy → paste button becomes enabled (was disabled before)
  it('9. copy style: click → paste style button enabled', () => {
    renderToolbar()
    const copy = screen.getByRole('button', { name: 'Copy style' })
    const paste = screen.getByRole('button', { name: 'Paste style' })
    expect((paste as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(copy)
    expect((paste as HTMLButtonElement).disabled).toBe(false)
  })

  // 10. Paste style: after copy, click paste → onStyleApply called with copied style
  it('10. paste style: click → applies copied style onto element', () => {
    const el = makeTextEl()
    el.setAttribute('style', 'color: red; font-size: 20px')
    const { onStyleApply } = renderToolbar({ activeElement: el })
    const copy = screen.getByRole('button', { name: 'Copy style' })
    fireEvent.click(copy)
    // Simulate the element's style having drifted; paste should restore copied.
    el.setAttribute('style', 'font-size: 10px')
    const paste = screen.getByRole('button', { name: 'Paste style' })
    fireEvent.click(paste)
    expect(el.getAttribute('style')).toBe('color: red; font-size: 20px')
    // Commit via Apply → onStyleApply carries the pasted style.
    const apply = screen.getByRole('button', { name: 'Apply' })
    fireEvent.click(apply)
    expect(onStyleApply).toHaveBeenCalled()
    const arg = onStyleApply.mock.calls[0][0] as { style: string }
    expect(arg.style).toContain('color')
  })

  // 11. Delete: click delete → confirmation dialog appears; confirm →
  // onStyleApply called with display:none; cancel → no callback fired
  it('11. delete: confirm → onStyleApply display:none; cancel → no edit', () => {
    const { onStyleApply, onClose } = renderToolbar()
    const deleteBtn = screen.getByRole('button', { name: 'Delete element' })
    // Cancel path
    fireEvent.click(deleteBtn)
    const dialog = screen.getByTestId('alert-dialog-content')
    expect(dialog).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onStyleApply).not.toHaveBeenCalled()
    // Confirm path
    fireEvent.click(deleteBtn)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onStyleApply).toHaveBeenCalled()
    const arg = onStyleApply.mock.calls[0][0] as { style: string }
    expect(arg.style).toBe('display: none')
    expect(onClose).toHaveBeenCalled()
  })

  // 12. Move up: click → onMoveUp called
  it('12. move up: click → onMoveUp called', () => {
    const { onMoveUp } = renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))
    expect(onMoveUp).toHaveBeenCalledTimes(1)
  })

  // 13. Move down: click → onMoveDown called
  it('13. move down: click → onMoveDown called', () => {
    const { onMoveDown } = renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))
    expect(onMoveDown).toHaveBeenCalledTimes(1)
  })

  // 14. Undo: click → onUndo called; when undo stack empty, button is disabled
  it('14. undo: click → onUndo; disabled when canUndo=false', () => {
    const { onUndo } = renderToolbar({ canUndo: true })
    const undo = screen.getByRole('button', { name: 'Undo' })
    expect((undo as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(undo)
    expect(onUndo).toHaveBeenCalledTimes(1)
    cleanup()
    document.body.innerHTML = ''
    const r2 = renderToolbar({ canUndo: false })
    const undo2 = screen.getByRole('button', { name: 'Undo' })
    expect((undo2 as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(undo2)
    expect(r2.onUndo).not.toHaveBeenCalled()
  })

  // 15. Redo: click → onRedo called; when redo stack empty, button is disabled
  it('15. redo: click → onRedo; disabled when canRedo=false', () => {
    const { onRedo } = renderToolbar({ canRedo: true })
    const redo = screen.getByRole('button', { name: 'Redo' })
    expect((redo as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(redo)
    expect(onRedo).toHaveBeenCalledTimes(1)
    cleanup()
    document.body.innerHTML = ''
    const r2 = renderToolbar({ canRedo: false })
    const redo2 = screen.getByRole('button', { name: 'Redo' })
    expect((redo2 as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(redo2)
    expect(r2.onRedo).not.toHaveBeenCalled()
  })

  // 16. Apply: click → onStyleApply called with current style
  it('16. apply: click → onStyleApply called with current style', () => {
    const { onStyleApply, onCommitText } = renderToolbar()
    // Modify a style control so userModifiedRef flips before apply.
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onCommitText).toHaveBeenCalled()
    expect(onStyleApply).toHaveBeenCalled()
    const arg = onStyleApply.mock.calls[0][0] as {
      sourceAnchor: string
      style: string
      occurrenceIndex: number
    }
    expect(arg.sourceAnchor).toBe('hero-title')
    expect(arg.style).toContain('700')
  })

  // 17. Close: click → onClose called
  it('17. close: click → onClose called', () => {
    const { onClose } = renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // 18. isApplying=true: apply button shows loading state AND is disabled
  it('18. isApplying: apply button shows Saving... and is disabled', () => {
    renderToolbar({ isApplying: true })
    const apply = screen.getByRole('button', { name: /Saving/i })
    expect(apply).not.toBeNull()
    expect((apply as HTMLButtonElement).disabled).toBe(true)
    expect(apply.textContent ?? '').toContain('Saving')
    // Spinner svg present inside the apply button.
    expect(apply.querySelector('.animate-spin')).not.toBeNull()
  })

  // 19. isForking=true: shows forking indicator
  it('19. isForking: apply button shows Forking... indicator', () => {
    renderToolbar({ isForking: true })
    const apply = screen.getByRole('button', { name: /Forking/i })
    expect(apply).not.toBeNull()
    expect((apply as HTMLButtonElement).disabled).toBe(true)
    expect(apply.textContent ?? '').toContain('Forking')
    expect(apply.querySelector('.animate-spin')).not.toBeNull()
  })

  // 20. Style panel: click → StyleControlsPanel visible; click again → hidden
  it('20. style panel: click → StyleControlsPanel appears; click → collapses', () => {
    renderToolbar()
    const toggle = screen.getByRole('button', { name: 'Style controls' })
    fireEvent.click(toggle)
    // StyleControlsPanel renders tab buttons (Spacing, Border, ...).
    expect(screen.getByRole('button', { name: 'Spacing' })).not.toBeNull()
    expect(isActive(toggle)).toBe(true)
    fireEvent.click(toggle)
    // Collapsed: toggle no longer active.
    expect(isActive(toggle)).toBe(false)
  })

  // 21. Typography panel: click → TypographyControlsPanel visible
  it('21. typography panel: click → TypographyControlsPanel appears', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Typography controls' }))
    // TypographyControlsPanel renders a line-height input with placeholder
    // "normal".
    expect(screen.getByPlaceholderText('normal')).not.toBeNull()
  })

  // 22. Link panel: click → LinkEditPopover visible
  it('22. link panel: click → LinkEditPopover appears', () => {
    renderToolbar({ activeElement: makeLinkEl() })
    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    expect(screen.getByPlaceholderText('https://...')).not.toBeNull()
  })

  // 23. Image panel: click → ImageSwapPanel visible
  it('23. image panel: click → ImageSwapPanel appears', () => {
    renderToolbar({ activeElement: makeImageEl(), sessionId: 'sess-1' })
    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    expect(screen.getByPlaceholderText('Search stock images...')).not.toBeNull()
  })

  // 24. Escape key → onClose called
  it('24. escape key: closes toolbar (onClose)', () => {
    const { onClose } = renderToolbar()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // 25. Click outside → onClose called
  it('25. click outside: closes toolbar (onClose)', () => {
    const { onClose } = renderToolbar()
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    fireEvent.mouseDown(outside)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
