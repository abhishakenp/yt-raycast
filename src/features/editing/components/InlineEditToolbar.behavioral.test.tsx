// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { StockImageResult } from '@/lib/stock-image'
import { createElement, useState, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resizeObserverCallbacks: ResizeObserverCallback[] = []

// jsdom lacks ResizeObserver / IntersectionObserver — provide stubs.
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallbacks.push(callback)
      }
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
    escape: (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`),
  }
  ;(globalThis as { CSS?: { escape?: unknown } }).CSS = {
    ...((globalThis as { CSS?: { escape?: unknown } }).CSS ?? {}),
    ...cssShim,
  }
}

// --- Mocks -----------------------------------------------------------------

const floatingUpdateSpy = vi.hoisted(() => vi.fn())
const floatingStyleState = vi.hoisted(() => ({
  top: '0px',
  left: '0px',
  transform: undefined as string | undefined,
}))
const searchStockImagesMock = vi.hoisted(() =>
  vi.fn<() => Promise<StockImageResult[]>>(async () => []),
)
const useQueryMock = vi.hoisted(() => vi.fn<() => unknown>(() => undefined))

// convex/react is used by the image/background panels. Provide no-op hooks.
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(async () => undefined),
  useQuery: useQueryMock,
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
  searchStockImages: searchStockImagesMock,
  buildBackgroundImageUrl: (
    result: { baseUrl?: string; imageUrl?: string },
    resolution: string,
  ) =>
    result.baseUrl ? `${result.baseUrl}?res=${resolution}` : result.imageUrl,
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
    floatingStyles: {
      position: 'fixed',
      top: floatingStyleState.top,
      left: floatingStyleState.left,
      transform: floatingStyleState.transform,
    },
    update: floatingUpdateSpy,
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
  const AlertDialog = ({ children }: { children?: ReactNode }) => {
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
    children?: ReactNode
    asChild?: boolean
    [key: string]: unknown
  }) => {
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
  const AlertDialogContent = ({ children }: { children?: ReactNode }) => {
    const ctx = React.useContext(Ctx)
    if (!ctx.open) return null
    return React.createElement(
      'div',
      { role: 'alertdialog', 'data-testid': 'alert-dialog-content' },
      children,
    )
  }
  const AlertDialogPortal = ({ children }: { children?: ReactNode }) => children
  const AlertDialogHeader = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogTitle = ({ children }: { children?: ReactNode }) =>
    React.createElement('h2', null, children)
  const AlertDialogDescription = ({ children }: { children?: ReactNode }) =>
    React.createElement('p', null, children)
  const AlertDialogFooter = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children)
  const AlertDialogCancel = ({
    children,
    onClick,
    ...rest
  }: {
    children?: ReactNode
    onClick?: (e: React.MouseEvent) => void
    [key: string]: unknown
  }) => {
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
    children?: ReactNode
    onClick?: (e: React.MouseEvent) => void
    [key: string]: unknown
  }) => {
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
  const SelectContent = ({ children }: { children?: ReactNode }) => children
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
    children?: ReactNode
    [key: string]: unknown
  }) => {
    const content = React.Children.toArray(children).find(
      (c) =>
        React.isValidElement(c) &&
        (c as React.ReactElement).type === SelectContent,
    )
    return React.createElement(
      'select',
      {
        ...rest,
        value: value ?? defaultValue ?? '',
        onChange: (e: { target: { value: string } }) =>
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
    value?: string
    children?: ReactNode
  }) => React.createElement('option', { value }, children)
  const SelectGroup = ({ children }: { children?: ReactNode }) => children
  const SelectLabel = ({ children }: { children?: ReactNode }) =>
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
  const ToggleGroupContext = React.createContext<{
    value: string | undefined
    onValueChange: ((value: string) => void) | undefined
  }>({ value: undefined, onValueChange: undefined })
  const ToggleGroup = ({
    children,
    value,
    onValueChange,
    ...rest
  }: {
    children?: ReactNode
    value?: string
    onValueChange?: (v: string) => void
    [key: string]: unknown
  }) =>
    React.createElement(
      ToggleGroupContext.Provider,
      { value: { value, onValueChange } },
      React.createElement('div', { ...rest, role: 'group' }, children),
    )
  const ToggleGroupItem = ({
    value,
    children,
    ...rest
  }: {
    value?: string
    children?: ReactNode
    [key: string]: unknown
  }) => {
    const group = React.useContext(ToggleGroupContext)
    return React.createElement(
      'button',
      {
        ...rest,
        'aria-pressed': group.value === value,
        type: 'button',
        value,
        onClick: () => group.onValueChange?.(value ?? ''),
      },
      children,
    )
  }
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

// Static import — avoids vi.resetModules() which re-imports the heavy
// @ship-fast/blocks graph and exceeds the hook timeout on cold imports.
import {
  InlineEditToolbar,
  __resetCopiedStyleForTests,
} from './InlineEditToolbar'
let originalRaf: typeof globalThis.requestAnimationFrame

beforeEach(() => {
  __resetCopiedStyleForTests()
  floatingUpdateSpy.mockClear()
  floatingStyleState.top = '0px'
  floatingStyleState.left = '0px'
  floatingStyleState.transform = undefined
  resizeObserverCallbacks.length = 0
  searchStockImagesMock.mockReset()
  searchStockImagesMock.mockResolvedValue([])
  useQueryMock.mockReset()
  useQueryMock.mockReturnValue(undefined)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue(
    fakeComputedStyle as unknown as CSSStyleDeclaration,
  )
  originalRaf = globalThis.requestAnimationFrame
  // Run rAF callbacks synchronously so styleReadCompleteRef flips immediately.
  globalThis.requestAnimationFrame = ((cb) => {
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

function makeSectionEl() {
  const el = document.createElement('section')
  el.className = 'hero-section bg-white py-20'
  el.textContent = 'Hero section'
  document.body.appendChild(el)
  return el
}

function makeIdOnlySectionEl(id = 'newsletter_newsletter') {
  const el = document.createElement('section')
  el.id = id
  el.textContent = 'Newsletter section'
  document.body.appendChild(el)
  return el
}

// The active visual class applied to toggled buttons in the real component.
const ACTIVE_CLASS = 'bg-cyan-300/20'

function isActive(btn: HTMLElement): boolean {
  return btn.className.includes(ACTIVE_CLASS)
}

function findAnimatedPanel(container: HTMLElement): HTMLElement {
  const panel = Array.from(container.querySelectorAll('div')).find(
    (node) => node.style.gridTemplateRows !== '',
  )
  if (!panel) throw new Error('Animated panel container was not rendered')
  return panel
}

interface RenderOpts {
  activeElement?: HTMLElement
  isApplying?: boolean
  isForking?: boolean
  isSectionSubmitting?: boolean
  sectionError?: string
  canUndo?: boolean
  canRedo?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  sessionId?: string
  onLinkEdit?: Parameters<typeof InlineEditToolbar>[0]['onLinkEdit']
  onImageSelect?: Parameters<typeof InlineEditToolbar>[0]['onImageSelect']
  onSelectParentSection?: Parameters<
    typeof InlineEditToolbar
  >[0]['onSelectParentSection']
  onSelectParent?: Parameters<typeof InlineEditToolbar>[0]['onSelectParent']
  onSectionEdit?: (prompt: string) => void
  disableSectionEdit?: boolean
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
  const onLinkEdit = opts.onLinkEdit ?? vi.fn()
  const onImageSelect = opts.onImageSelect ?? vi.fn()
  const onSectionEdit = opts.onSectionEdit ?? vi.fn()
  const sectionEditProp = opts.disableSectionEdit ? undefined : onSectionEdit
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
      onSelectParentSection: opts.onSelectParentSection,
      onSelectParent: opts.onSelectParent,
      sessionId: opts.sessionId,
      onSectionEdit: sectionEditProp,
      isSectionSubmitting: opts.isSectionSubmitting ?? false,
      sectionError: opts.sectionError,
    }),
  )
  const baseProps = {
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
    onSelectParentSection: opts.onSelectParentSection,
    onSelectParent: opts.onSelectParent,
    sessionId: opts.sessionId,
    onSectionEdit: sectionEditProp,
    isSectionSubmitting: opts.isSectionSubmitting ?? false,
    sectionError: opts.sectionError,
  }
  return {
    ...utils,
    rerenderToolbar(nextOpts: Partial<RenderOpts> = {}) {
      utils.rerender(
        createElement(InlineEditToolbar, {
          ...baseProps,
          ...nextOpts,
          activeElement: nextOpts.activeElement ?? baseProps.activeElement,
        }),
      )
    },
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
    onSectionEdit,
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

  it('5b. formatting and alignment toggles expose pressed state to assistive tech', () => {
    renderToolbar()
    const bold = screen.getByRole('button', { name: 'Bold' })
    const italic = screen.getByRole('button', { name: 'Italic' })
    const left = screen.getByRole('button', { name: 'Align left' })
    const center = screen.getByRole('button', { name: 'Align center' })
    const right = screen.getByRole('button', { name: 'Align right' })

    expect(bold.getAttribute('aria-pressed')).toBe('false')
    expect(italic.getAttribute('aria-pressed')).toBe('false')
    expect(left.getAttribute('aria-pressed')).toBe('true')
    expect(center.getAttribute('aria-pressed')).toBe('false')
    expect(right.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(bold)
    fireEvent.click(italic)
    fireEvent.click(center)

    expect(bold.getAttribute('aria-pressed')).toBe('true')
    expect(italic.getAttribute('aria-pressed')).toBe('true')
    expect(left.getAttribute('aria-pressed')).toBe('false')
    expect(center.getAttribute('aria-pressed')).toBe('true')
    expect(right.getAttribute('aria-pressed')).toBe('false')
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

  it('6b. font size controls are named by role for keyboard and assistive tech users', () => {
    renderToolbar()

    const sizeInput = screen.getByRole('spinbutton', { name: 'Font size' })
    const unitSelect = screen.getByRole('combobox', {
      name: 'Font size unit',
    })

    fireEvent.change(sizeInput, { target: { value: '28' } })
    fireEvent.change(unitSelect, { target: { value: 'rem' } })

    expect((sizeInput as HTMLInputElement).value).toBe('28')
    expect((unitSelect as HTMLSelectElement).value).toBe('rem')
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

  it('9b. paste style: copying an unstyled element clears inline style on the target', () => {
    const source = makeTextEl()
    const target = makeTextEl()
    target.setAttribute('style', 'color: red; font-size: 20px')
    const { rerenderToolbar, onStyleApply } = renderToolbar({
      activeElement: source,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy style' }))

    rerenderToolbar({ activeElement: target })
    fireEvent.click(screen.getByRole('button', { name: 'Paste style' }))

    expect(target.hasAttribute('style')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onStyleApply).toHaveBeenCalledWith({
      sourceAnchor: 'hero-title',
      style: '',
      occurrenceIndex: 1,
    })
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

  // --- Layering (bring to front / send to back) ----------------------------
  // This file globally mocks getComputedStyle to a fixed fakeComputedStyle
  // (no z-index/position). handleLayer reads sibling z-index and the active
  // element's position through getComputedStyle, so the layering tests install
  // a reflective mock that surfaces each element's real inline z-index/position
  // (falling back to the CSS defaults 'auto'/'static'). Everything else the
  // toolbar reads (font size/weight, etc.) still comes from fakeComputedStyle.
  function useReflectiveComputedStyle() {
    vi.mocked(window.getComputedStyle).mockImplementation(
      (el) =>
        ({
          ...fakeComputedStyle,
          zIndex: (el as HTMLElement).style?.zIndex || 'auto',
          position: (el as HTMLElement).style?.position || 'static',
        }) as unknown as CSSStyleDeclaration,
    )
  }

  // Builds an element nested among siblings that carry inline z-indices, so
  // the front/back computation (max+1 / min-1) is exercised against real
  // sibling stacking values surfaced by the reflective getComputedStyle mock.
  function makeLayeringEl(siblingZIndices: number[] = []) {
    const parent = document.createElement('div')
    const el = document.createElement('div')
    el.className = 'promo-badge'
    el.textContent = 'Popular'
    parent.appendChild(el)
    for (const z of siblingZIndices) {
      const sib = document.createElement('div')
      sib.className = 'sib'
      sib.style.zIndex = String(z)
      parent.appendChild(sib)
    }
    document.body.appendChild(parent)
    return el
  }

  // 13a. Bring to front is a LIVE PREVIEW: promotes static→relative, sets
  // z-index above the highest sibling on the element immediately, but keeps
  // the toolbar open and does NOT persist until Apply is pressed.
  it('13a. bring to front: live z-index = max(siblings)+1, promotes position, persists only on Apply', () => {
    const el = makeLayeringEl([3, 7])
    const { onStyleApply, onClose } = renderToolbar({ activeElement: el })
    useReflectiveComputedStyle()

    fireEvent.click(screen.getByRole('button', { name: 'Bring to front' }))

    // Live DOM updated for the preview — but nothing committed and the toolbar
    // stays open so the user can keep adjusting / decide to keep or revert.
    expect(el.style.zIndex).toBe('8')
    expect(el.style.position).toBe('relative')
    expect(onStyleApply).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    // Commit via Apply → persisted through the style-override path with the
    // full merged inline style.
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onStyleApply).toHaveBeenCalledTimes(1)
    const arg = onStyleApply.mock.calls[0][0] as {
      sourceAnchor: string
      style: string
      occurrenceIndex: number
    }
    expect(arg.sourceAnchor).toBe('promo-badge')
    expect(arg.occurrenceIndex).toBe(0)
    expect(arg.style).toContain('z-index: 8')
    expect(arg.style).toContain('position: relative')
  })

  // 13b. Send to back: live z-index below the lowest sibling; Apply persists.
  it('13b. send to back: live z-index = min(siblings)-1, persists on Apply', () => {
    const el = makeLayeringEl([3, 7])
    const { onStyleApply } = renderToolbar({ activeElement: el })
    useReflectiveComputedStyle()

    fireEvent.click(screen.getByRole('button', { name: 'Send to back' }))
    expect(el.style.zIndex).toBe('2')
    expect(onStyleApply).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const arg = onStyleApply.mock.calls[0][0] as { style: string }
    expect(arg.style).toContain('z-index: 2')
  })

  // 13c. No positioned siblings → front defaults to 1, back to -1. An already
  // non-static position is left untouched (not clobbered back to relative).
  it('13c. no positioned siblings → front=1 / back=-1; keeps explicit position', () => {
    const front = makeLayeringEl()
    front.style.position = 'absolute'
    renderToolbar({ activeElement: front })
    useReflectiveComputedStyle()
    fireEvent.click(screen.getByRole('button', { name: 'Bring to front' }))
    expect(front.style.zIndex).toBe('1')
    // position:absolute preserved — layering must not override author intent.
    expect(front.style.position).toBe('absolute')
    cleanup()
    document.body.innerHTML = ''

    const back = makeLayeringEl()
    renderToolbar({ activeElement: back })
    useReflectiveComputedStyle()
    fireEvent.click(screen.getByRole('button', { name: 'Send to back' }))
    expect(back.style.zIndex).toBe('-1')
  })

  // 13d. Reverts on cancel: previewing a layer change then closing without
  // Apply restores the element's original inline style and persists nothing.
  it('13d. bring to front then Close (cancel) → reverts to original, no persist', () => {
    const el = makeLayeringEl([3, 7])
    el.setAttribute('style', 'color: blue')
    const { onStyleApply } = renderToolbar({ activeElement: el })
    useReflectiveComputedStyle()

    fireEvent.click(screen.getByRole('button', { name: 'Bring to front' }))
    // Preview is visible...
    expect(el.style.zIndex).toBe('8')

    // ...then the user cancels → original style restored, nothing saved.
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(el.getAttribute('style')).toBe('color: blue')
    expect(onStyleApply).not.toHaveBeenCalled()
  })

  // 13e. Merges into existing inline style on Apply (does not clobber prior
  // overrides); the buttons are disabled while a save is in flight.
  it('13e. merges with existing inline style on Apply; disabled while applying', () => {
    const el = makeLayeringEl([2])
    el.setAttribute('style', 'color: red')
    const { onStyleApply } = renderToolbar({ activeElement: el })
    useReflectiveComputedStyle()

    fireEvent.click(screen.getByRole('button', { name: 'Bring to front' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    const arg = onStyleApply.mock.calls[0][0] as { style: string }
    expect(arg.style).toContain('color: red')
    expect(arg.style).toContain('z-index: 3')

    cleanup()
    document.body.innerHTML = ''

    const el2 = makeLayeringEl([2])
    const r2 = renderToolbar({ activeElement: el2, isApplying: true })
    const frontBtn = screen.getByRole('button', { name: 'Bring to front' })
    expect((frontBtn as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(frontBtn)
    // No live mutation happened either — guard short-circuits.
    expect(el2.style.zIndex).toBe('')
    expect(r2.onStyleApply).not.toHaveBeenCalled()
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

  it('19a. moves focus into the toolbar when it opens (accessibility: keyboard users previously had to tab in from elsewhere)', () => {
    const { container } = renderToolbar()
    const toolbar = container.querySelector<HTMLElement>('.inline-edit-toolbar')
    expect(toolbar).not.toBeNull()
    expect(document.activeElement).toBe(toolbar)
  })

  it('19b. restores focus to the edited element when the toolbar unmounts (accessibility: keyboard/screen-reader users previously lost focus context on close)', () => {
    const activeElement = makeTextEl()
    const { unmount } = renderToolbar({ activeElement })

    unmount()

    expect(document.activeElement).toBe(activeElement)
  })

  it('19c. does not steal focus from a live contentEditable text edit (regression: cursor vanished out of the text ~100ms after clicking it, right after useTextEdit placed the caret)', () => {
    const activeElement = makeTextEl()
    // jsdom doesn't implement the contentEditable IDL property's attribute
    // reflection, so set the attribute directly — this is what real browsers
    // end up with after useTextEdit.ts's `textEl.contentEditable = 'true'`,
    // and matches how the rest of the codebase detects an active text edit
    // (e.g. translation.tsx's ACTIVE_TEXT_EDIT_SELECTOR uses the same attribute).
    activeElement.setAttribute('contenteditable', 'true')
    // jsdom also doesn't treat contentEditable elements as implicitly
    // focusable — a tabIndex is required for .focus() to take effect here.
    // Real browsers need no such attribute.
    activeElement.tabIndex = -1
    activeElement.focus()
    expect(document.activeElement).toBe(activeElement)

    const { container } = renderToolbar({ activeElement })
    const toolbar = container.querySelector<HTMLElement>('.inline-edit-toolbar')
    expect(toolbar).not.toBeNull()
    expect(document.activeElement).toBe(activeElement)
    expect(document.activeElement).not.toBe(toolbar)
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

  it('20b. opening style panels requests floating reposition so Apply remains reachable near viewport edges', async () => {
    renderToolbar()
    floatingUpdateSpy.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      expect(floatingUpdateSpy).toHaveBeenCalled()
    })
  })

  it('20c. clamps offscreen top placement so Apply stays inside the viewport', async () => {
    floatingStyleState.top = '-168.5px'
    const { container } = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      expect(toolbar?.style.top).toBe('8px')
    })
  })

  it('20d. clamps transform-based offscreen placement from Floating UI', async () => {
    floatingStyleState.top = '8px'
    floatingStyleState.transform = 'translate(199px, -177.5px)'
    const { container } = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      expect(toolbar?.style.transform).toBe('translate(199px, 0px)')
    })
  })

  it('20d.1. clamps offscreen left placement so Apply stays inside the viewport (regression: only top/y was ever clamped)', async () => {
    floatingStyleState.left = '-168.5px'
    const { container } = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      expect(toolbar?.style.left).toBe('8px')
    })
  })

  it('20d.2. clamps transform-based offscreen left placement from Floating UI (regression: only the y component was ever clamped)', async () => {
    floatingStyleState.top = '8px'
    floatingStyleState.left = '8px'
    floatingStyleState.transform = 'translate(-199px, 0px)'
    const { container } = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      expect(toolbar?.style.transform).toBe('translate(0px, 0px)')
    })
  })

  it('20d.3. clamps offscreen right placement (wide toolbar near the right edge) so Apply stays reachable', async () => {
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
    })
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function getOffsetWidth(this: HTMLElement) {
        return this.dataset.inlineEditWrapper === 'true' ? 320 : 0
      },
    )
    // Anchored near the right edge of a 400px-wide viewport — a 320px-wide
    // toolbar placed here would overflow past innerWidth without clamping.
    floatingStyleState.left = '350px'
    const { container } = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      // maxLeft = innerWidth(400) - width(320) - padding(8) = 72
      expect(toolbar?.style.left).toBe('72px')
    })

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('20e. reclamps after BG image results grow the panel so Apply remains reachable', async () => {
    const originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 360,
    })
    let toolbarHeight = 40
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function getOffsetHeight(this: HTMLElement) {
        return this.dataset.inlineEditWrapper === 'true' ? toolbarHeight : 0
      },
    )
    floatingStyleState.top = '300px'
    searchStockImagesMock.mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => ({
        imageUrl: `https://images.pexels.com/photos/${index}/replacement.jpeg`,
        query: `result ${index}`,
        source: 'pexels' as const,
      })),
    )
    const { container } = renderToolbar({ sessionId: 'sess-1' })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    await new Promise((resolve) => setTimeout(resolve, 270))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'large result grid' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    await screen.findByRole('button', { name: 'Select image 9' })
    toolbarHeight = 340
    await act(async () => {
      for (const callback of resizeObserverCallbacks) {
        callback([], {} as ResizeObserver)
      }
    })

    await waitFor(() => {
      const toolbar = container.querySelector<HTMLElement>(
        '.inline-edit-toolbar',
      )
      const apply = screen.getByRole('button', { name: 'Apply' })
      expect(toolbar?.style.top).toBe('12px')
      expect(apply).not.toBeNull()
      expect((apply as HTMLButtonElement).disabled).toBe(false)
    })

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    })
  })

  it('20e.1. commits a selected section background after a large BG result grid opens', async () => {
    const originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 360,
    })
    let toolbarHeight = 40
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function getOffsetHeight(this: HTMLElement) {
        return this.dataset.inlineEditWrapper === 'true' ? toolbarHeight : 0
      },
    )
    floatingStyleState.top = '300px'
    const imageUrl =
      'https://images.pexels.com/photos/8/reachable-background.jpeg'
    searchStockImagesMock.mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => ({
        imageUrl:
          index === 8
            ? imageUrl
            : `https://images.pexels.com/photos/${index}/replacement.jpeg`,
        query: `result ${index}`,
        source: 'pexels' as const,
      })),
    )
    const sectionElement = makeSectionEl()
    const { onClose, onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
      fireEvent.click(screen.getByRole('button', { name: 'BG' }))
      await new Promise((resolve) => setTimeout(resolve, 270))
      fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
        target: { value: 'large result grid' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

      const result = await screen.findByRole('button', {
        name: 'Select image 9',
      })
      toolbarHeight = 340
      await act(async () => {
        for (const callback of resizeObserverCallbacks) {
          callback([], {} as ResizeObserver)
        }
      })
      fireEvent.click(result)
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

      expect(onStyleApply).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceAnchor: 'hero-section bg-white py-20',
          occurrenceIndex: 0,
          style: expect.stringContaining(imageUrl),
        }),
      )
      expect(sectionElement.style.backgroundImage).toContain(imageUrl)
      expect(sectionElement.style.backgroundSize).toBe('cover')
      expect(sectionElement.style.backgroundPosition).toBe('center center')
      expect(onClose).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      })
    }
  })

  it('20e.2. commits a selected text-element background image through Apply', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/text-bg/reachable-background.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'text background',
        source: 'pexels',
      },
    ])
    const textElement = makeTextEl()
    const { onClose, onStyleApply } = renderToolbar({
      activeElement: textElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'text background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'hero-title',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
    expect(textElement.style.backgroundImage).toContain(imageUrl)
    expect(textElement.style.backgroundSize).toBe('cover')
    expect(textElement.style.backgroundPosition).toBe('center center')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('20f. keeps Apply and Close outside the horizontal tool scroller so they remain reachable', () => {
    const { container } = renderToolbar()

    const toolScroller = container.querySelector('[data-inline-toolbar-scroll]')
    const actionGroup = container.querySelector('[data-inline-toolbar-actions]')
    const apply = screen.getByRole('button', { name: 'Apply' })
    const close = screen.getByRole('button', { name: 'Close' })

    expect(toolScroller).not.toBeNull()
    expect(actionGroup).not.toBeNull()
    expect(toolScroller?.contains(apply)).toBe(false)
    expect(toolScroller?.contains(close)).toBe(false)
    expect(actionGroup?.contains(apply)).toBe(true)
    expect(actionGroup?.contains(close)).toBe(true)
  })

  it('20g. closing after a size preview removes temporary inline edit styles', () => {
    const headingElement = makeTextEl()
    headingElement.dataset.shipFastInlineEditing = 'true'
    headingElement.setAttribute(
      'style',
      'outline: 2px solid hsl(var(--primary)); outline-offset: 2px; cursor: text;',
    )
    const { onClose } = renderToolbar({ activeElement: headingElement })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'Size' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Width' }), {
      target: { value: '320' },
    })

    expect(headingElement.style.width).toBe('320px')

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(headingElement.hasAttribute('style')).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // 21. Typography panel: click → TypographyControlsPanel visible
  it('21. typography panel: click → TypographyControlsPanel appears', () => {
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'Typography controls' }))
    // TypographyControlsPanel renders a line-height input with placeholder
    // "normal".
    expect(screen.getByPlaceholderText('normal')).not.toBeNull()
  })

  it('21b. expanded panels expose expanded state on their trigger buttons', () => {
    renderToolbar()
    const style = screen.getByRole('button', { name: 'Style controls' })
    const typography = screen.getByRole('button', {
      name: 'Typography controls',
    })
    const ai = screen.getByRole('button', { name: 'AI edit' })

    expect(style.getAttribute('aria-expanded')).toBe('false')
    expect(typography.getAttribute('aria-expanded')).toBe('false')
    expect(ai.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(style)
    expect(style.getAttribute('aria-expanded')).toBe('true')
    expect(typography.getAttribute('aria-expanded')).toBe('false')
    expect(ai.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(typography)
    expect(style.getAttribute('aria-expanded')).toBe('false')
    expect(typography.getAttribute('aria-expanded')).toBe('true')
    expect(ai.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(ai)
    expect(style.getAttribute('aria-expanded')).toBe('false')
    expect(typography.getAttribute('aria-expanded')).toBe('false')
    expect(ai.getAttribute('aria-expanded')).toBe('true')
  })

  it('21b.1. does not expose AI edit when no section edit handler is available', () => {
    renderToolbar({ disableSectionEdit: true })

    expect(screen.queryByRole('button', { name: 'AI edit' })).toBeNull()
  })

  it('21b.2. closes the AI panel if section editing becomes unavailable', async () => {
    const { container, rerenderToolbar } = renderToolbar()
    const ai = screen.getByRole('button', { name: 'AI edit' })

    fireEvent.click(ai)
    expect(
      screen.getByRole('textbox', { name: 'Describe AI edit' }),
    ).toBeTruthy()
    expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('1fr')

    rerenderToolbar({ onSectionEdit: undefined })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'AI edit' })).toBeNull()
      expect(
        screen.queryByRole('textbox', { name: 'Describe AI edit' }),
      ).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
  })

  it('21b.3. expanded panel content is horizontally centered so it does not hug the left when the toolbar row is wider than the panel', () => {
    const { container } = renderToolbar()
    const style = screen.getByRole('button', { name: 'Style controls' })

    fireEvent.click(style)
    expect(style.getAttribute('aria-expanded')).toBe('true')

    // The animated panel container holds a single inner wrapper that carries
    // the fixed panel width (w-[32.5rem]/w-[40rem]). It must also carry
    // `mx-auto` so the panel centers when the toolbar row is wider than it.
    const animatedPanel = findAnimatedPanel(container)
    const panelWrapper = animatedPanel.querySelector(
      '[data-inline-edit-wrapper="true"]',
    ) as HTMLElement | null
    expect(panelWrapper).not.toBeNull()
    expect(panelWrapper?.className).toContain('mx-auto')
  })

  it('21c. AI edit panel exposes a named prompt and submits a trimmed prompt with Enter', () => {
    const onSectionEdit = vi.fn()
    renderToolbar({ onSectionEdit })

    fireEvent.click(screen.getByRole('button', { name: 'AI edit' }))
    const prompt = screen.getByRole('textbox', { name: 'Describe AI edit' })
    const generate = screen.getByRole('button', { name: 'Generate' })

    expect((generate as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(prompt, {
      target: { value: '  Make the hero more premium  ' },
    })
    fireEvent.keyDown(prompt, { key: 'Enter', code: 'Enter', shiftKey: false })

    expect(onSectionEdit).toHaveBeenCalledTimes(1)
    expect(onSectionEdit).toHaveBeenCalledWith('Make the hero more premium')
  })

  it('21c.1. AI edit keeps Shift+Enter as multiline prompt input instead of submitting', () => {
    const onSectionEdit = vi.fn()
    renderToolbar({ onSectionEdit })

    fireEvent.click(screen.getByRole('button', { name: 'AI edit' }))
    const prompt = screen.getByRole('textbox', { name: 'Describe AI edit' })

    fireEvent.change(prompt, { target: { value: 'Make it dreamy' } })
    fireEvent.keyDown(prompt, { key: 'Enter', code: 'Enter', shiftKey: true })

    expect(onSectionEdit).not.toHaveBeenCalled()
    expect((prompt as HTMLTextAreaElement).value).toBe('Make it dreamy')
  })

  it('21c.2. AI edit announces pending and error states accessibly', () => {
    renderToolbar({
      isSectionSubmitting: true,
      sectionError: 'AI edit failed',
    })

    fireEvent.click(screen.getByRole('button', { name: 'AI edit' }))

    expect(screen.getByRole('status').textContent).toBe('Generating...')
    expect(screen.getByRole('alert').textContent).toBe('AI edit failed')
    expect(
      (
        screen.getByRole('textbox', {
          name: 'Describe AI edit',
        }) as HTMLTextAreaElement
      ).disabled,
    ).toBe(true)
    expect(
      (
        screen.getByRole('button', {
          name: 'Generating...',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
  })

  it('21d. AI edit cannot be opened while an edit is saving or forking', () => {
    const applying = renderToolbar({ isApplying: true })
    const applyingAi = screen.getByRole('button', { name: 'AI edit' })

    expect((applyingAi as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(applyingAi)
    expect(
      screen.queryByRole('textbox', { name: 'Describe AI edit' }),
    ).toBeNull()

    applying.unmount()

    renderToolbar({ isForking: true })
    const forkingAi = screen.getByRole('button', { name: 'AI edit' })

    expect((forkingAi as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(forkingAi)
    expect(
      screen.queryByRole('textbox', { name: 'Describe AI edit' }),
    ).toBeNull()
  })

  // 22. Link panel: click → LinkEditPopover visible
  it('22. link panel: click → LinkEditPopover appears', () => {
    renderToolbar({ activeElement: makeLinkEl() })
    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    expect(screen.getByPlaceholderText('https://...')).not.toBeNull()
  })

  it('22b. link panel trigger exposes expanded state', () => {
    renderToolbar({ activeElement: makeLinkEl() })
    const link = screen.getByRole('button', { name: 'Edit link' })

    expect(link.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(link)
    expect(link.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(link)
    expect(link.getAttribute('aria-expanded')).toBe('false')
  })

  it('22b.1. applying a link edit commits href, text, target, and rel through the toolbar callback', async () => {
    const linkElement = makeLinkEl()
    const { container, onLinkEdit, onClose } = renderToolbar({
      activeElement: linkElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'URL' }), {
      target: { value: '/learn' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Link Text' }), {
      target: { value: 'Read the guide' },
    })
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Apply' }).at(-1)!)

    const onLinkEditMock = onLinkEdit as ReturnType<typeof vi.fn>
    expect(onLinkEdit).toHaveBeenCalledTimes(1)
    expect(onLinkEditMock.mock.calls[0][0]).toMatchObject({
      oldHref: 'https://example.com',
      newHref: '/learn',
      oldText: 'Click here',
      newText: 'Read the guide',
      target: '_blank',
      occurrenceIndex: 0,
    })
    expect(onLinkEditMock.mock.calls[0][0].rel.split(/\s+/)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer', 'nofollow']),
    )
    expect(linkElement.getAttribute('target')).toBe('_blank')
    expect(linkElement.getAttribute('rel')?.split(/\s+/)).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer', 'nofollow']),
    )
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: 'URL' })).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('22c. escape after live-previewed link attrs reverts them without saving', () => {
    const linkElement = makeLinkEl()
    linkElement.setAttribute('rel', 'sponsored')
    const { onClose, onLinkEdit } = renderToolbar({
      activeElement: linkElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    expect(linkElement.getAttribute('target')).toBe('_blank')
    expect(linkElement.getAttribute('rel') ?? '').toContain('nofollow')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(linkElement.getAttribute('target')).toBeNull()
    expect(linkElement.getAttribute('rel')).toBe('sponsored')
    expect(onLinkEdit).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('22d. outside click after live-previewed link attrs reverts them without saving', () => {
    const linkElement = makeLinkEl()
    linkElement.setAttribute('rel', 'sponsored')
    const { onClose, onLinkEdit } = renderToolbar({
      activeElement: linkElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    expect(linkElement.getAttribute('target')).toBe('_blank')
    expect(linkElement.getAttribute('rel') ?? '').toContain('nofollow')

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    fireEvent.mouseDown(outside)

    expect(linkElement.getAttribute('target')).toBeNull()
    expect(linkElement.getAttribute('rel')).toBe('sponsored')
    expect(onLinkEdit).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('22e. toggling the link panel closed reverts live-previewed link attrs without saving', () => {
    const linkElement = makeLinkEl()
    linkElement.setAttribute('rel', 'sponsored')
    const { onClose, onLinkEdit } = renderToolbar({
      activeElement: linkElement,
    })

    const linkButton = screen.getByRole('button', { name: 'Edit link' })
    fireEvent.click(linkButton)
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    fireEvent.click(linkButton)

    expect(linkElement.getAttribute('target')).toBeNull()
    expect(linkElement.getAttribute('rel')).toBe('sponsored')
    expect(onLinkEdit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('22f. switching away from the link panel reverts live-previewed link attrs without saving', () => {
    const linkElement = makeLinkEl()
    linkElement.setAttribute('rel', 'sponsored')
    const { onClose, onLinkEdit } = renderToolbar({
      activeElement: linkElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))

    expect(linkElement.getAttribute('target')).toBeNull()
    expect(linkElement.getAttribute('rel')).toBe('sponsored')
    expect(onLinkEdit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(
      screen
        .getByRole('button', { name: 'Style controls' })
        .getAttribute('aria-expanded'),
    ).toBe('true')
  })

  it('22g. changing the active element after live-previewed link attrs reverts the old link without saving', () => {
    const firstLink = makeLinkEl()
    firstLink.setAttribute('rel', 'sponsored')
    const secondLink = makeLinkEl()
    secondLink.setAttribute('href', '/second')
    secondLink.textContent = 'Second link'
    const { onClose, onLinkEdit, rerenderToolbar } = renderToolbar({
      activeElement: firstLink,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    expect(firstLink.getAttribute('target')).toBe('_blank')
    expect(firstLink.getAttribute('rel') ?? '').toContain('nofollow')

    rerenderToolbar({ activeElement: secondLink })

    expect(firstLink.getAttribute('target')).toBeNull()
    expect(firstLink.getAttribute('rel')).toBe('sponsored')
    expect(secondLink.getAttribute('target')).toBeNull()
    expect(secondLink.getAttribute('rel')).toBeNull()
    expect(onLinkEdit).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('22h. changing from a link to non-link selection closes the link panel instead of leaving empty expanded space', async () => {
    const firstLink = makeLinkEl()
    const nextText = makeTextEl()
    const { container, rerenderToolbar } = renderToolbar({
      activeElement: firstLink,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    expect(screen.getByPlaceholderText('https://...')).not.toBeNull()
    expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('1fr')

    rerenderToolbar({ activeElement: nextText })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Edit link' })).toBeNull()
      expect(screen.queryByPlaceholderText('https://...')).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
  })

  it('22i. removing the link edit handler while the link panel is open closes the panel', async () => {
    const linkElement = makeLinkEl()
    linkElement.setAttribute('rel', 'sponsored')
    const { container, rerenderToolbar } = renderToolbar({
      activeElement: linkElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit link' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Open in new tab' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Noindex' }))

    expect(linkElement.getAttribute('target')).toBe('_blank')
    expect(linkElement.getAttribute('rel') ?? '').toContain('nofollow')
    expect(screen.getByPlaceholderText('https://...')).not.toBeNull()
    expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('1fr')

    rerenderToolbar({ onLinkEdit: undefined })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Edit link' })).toBeNull()
      expect(screen.queryByPlaceholderText('https://...')).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
    expect(linkElement.getAttribute('target')).toBeNull()
    expect(linkElement.getAttribute('rel')).toBe('sponsored')
  })

  // 23. Image panel: click → ImageSwapPanel visible
  it('23. image panel: click → ImageSwapPanel appears', () => {
    renderToolbar({ activeElement: makeImageEl(), sessionId: 'sess-1' })
    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    expect(screen.getByPlaceholderText('Search stock images...')).not.toBeNull()
  })

  it('23a. image panel trigger exposes expanded state', () => {
    renderToolbar({ activeElement: makeImageEl(), sessionId: 'sess-1' })
    const image = screen.getByRole('button', { name: 'Swap image' })

    expect(image.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(image)
    expect(image.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(image)
    expect(image.getAttribute('aria-expanded')).toBe('false')
  })

  it('23b. BG image selection on an img previews and commits through image swap, not a style edit', async () => {
    const imageUrl = 'https://images.pexels.com/photos/replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onClose, onImageSelect, onStyleApply } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)

    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)
    expect(imageElement.style.backgroundImage).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onImageSelect).toHaveBeenCalledWith(
      imageUrl,
      'https://example.com/orig.png',
    )
    expect(onStyleApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('23b.1. BG image selection on a section previews and commits through style apply', async () => {
    const imageUrl = 'https://images.pexels.com/photos/section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'section background',
        source: 'pexels',
      },
    ])
    const sectionElement = makeSectionEl()
    const { onClose, onImageSelect, onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)

    expect(sectionElement.style.backgroundImage).toContain(imageUrl)
    expect(sectionElement.style.backgroundSize).toBe('cover')
    expect(sectionElement.style.backgroundPosition).toBe('center center')

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onStyleApply).toHaveBeenCalledTimes(1)
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'hero-section bg-white py-20',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.1a. uploaded BG image selection on a section previews and commits through style apply', async () => {
    const imageUrl = 'https://ship-fast.test/uploads/section-bg.jpeg'
    useQueryMock.mockReturnValue([
      {
        url: imageUrl,
        filename: 'section-bg.jpeg',
      },
    ])
    const sectionElement = makeSectionEl()
    const { onClose, onImageSelect, onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Select uploaded image 1' }),
    )

    expect(sectionElement.style.backgroundImage).toContain(imageUrl)
    expect(sectionElement.style.backgroundSize).toBe('cover')
    expect(sectionElement.style.backgroundPosition).toBe('center center')

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onStyleApply).toHaveBeenCalledTimes(1)
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'hero-section bg-white py-20',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.2. BG image selection on an id-only section commits a durable id anchor', async () => {
    const imageUrl = 'https://images.pexels.com/photos/newsletter-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'newsletter background',
        source: 'pexels',
      },
    ])
    const sectionElement = makeIdOnlySectionEl()
    const { onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'newsletter background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#newsletter_newsletter',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3. BG image selection on an id-only section stores the raw id, not CSS escape syntax', async () => {
    const imageUrl = 'https://images.pexels.com/photos/special-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'special id background',
        source: 'pexels',
      },
    ])
    const sectionElement = makeIdOnlySectionEl('hero:newsletter/1')
    const { onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'special id background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#hero:newsletter/1',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3b. can promote a selected child text element to its section before applying a background image', async () => {
    const imageUrl = 'https://images.pexels.com/photos/promoted-section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'hero section background',
        source: 'pexels',
      },
    ])

    const sectionElement = document.createElement('section')
    sectionElement.id = 'hero_section'
    sectionElement.setAttribute('data-openui-var', 'home_hero')
    const headingElement = document.createElement('h1')
    headingElement.className = 'hero-title'
    headingElement.textContent = 'Hero title'
    sectionElement.appendChild(headingElement)
    document.body.appendChild(sectionElement)

    const onStyleApply = vi.fn()
    const onClose = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose,
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select section' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'hero section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(sectionElement.style.backgroundImage).toContain(imageUrl)
    expect(headingElement.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#hero_section',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.3c. keeps the toolbar open when a real pointer click promotes a text child to its section', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/promoted-section-pointer-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'pointer promoted background',
        source: 'pexels',
      },
    ])

    const sectionElement = document.createElement('section')
    sectionElement.id = 'pointer_hero_section'
    sectionElement.setAttribute('data-openui-var', 'home_pointer_hero')
    const headingElement = document.createElement('h1')
    headingElement.className = 'hero-title'
    headingElement.textContent = 'Pointer selected title'
    sectionElement.appendChild(headingElement)
    document.body.appendChild(sectionElement)

    const onStyleApply = vi.fn()
    const onClose = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose,
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    const promoteButton = screen.getByRole('button', {
      name: 'Select section',
    })
    fireEvent.mouseDown(promoteButton)
    fireEvent.mouseUp(promoteButton)
    fireEvent.click(promoteButton)

    expect(onClose).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Style controls' }),
    ).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'pointer promoted background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(sectionElement.style.backgroundImage).toContain(imageUrl)
    expect(headingElement.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#pointer_hero_section',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.3d. prevents pointer focus loss before promoting a focused text child to its section', () => {
    const sectionElement = document.createElement('section')
    sectionElement.id = 'focused_pointer_hero_section'
    const headingElement = document.createElement('h1')
    headingElement.className = 'hero-title'
    headingElement.textContent = 'Focused pointer title'
    headingElement.contentEditable = 'true'
    headingElement.tabIndex = -1
    sectionElement.appendChild(headingElement)
    document.body.appendChild(sectionElement)

    renderToolbar({
      activeElement: headingElement,
      onSelectParentSection: vi.fn(),
    })
    headingElement.focus()
    expect(document.activeElement).toBe(headingElement)

    const promoteButton = screen.getByRole('button', {
      name: 'Select section',
    })
    const pointerDown = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    })
    promoteButton.dispatchEvent(pointerDown)

    expect(pointerDown.defaultPrevented).toBe(true)
  })

  it('23b.3e. puts Select section first so it is reachable before narrow toolbar overflow', () => {
    const sectionElement = document.createElement('section')
    sectionElement.id = 'priority_hero_section'
    const headingElement = document.createElement('h1')
    headingElement.className = 'hero-title'
    headingElement.textContent = 'Priority title'
    sectionElement.appendChild(headingElement)
    document.body.appendChild(sectionElement)

    const { container } = renderToolbar({
      activeElement: headingElement,
      onSelectParentSection: vi.fn(),
    })

    const scroller = container.querySelector('[data-inline-toolbar-scroll]')
    expect(scroller).not.toBeNull()
    const firstButton = scroller?.querySelector('button')

    expect(firstButton?.getAttribute('aria-label')).toBe('Select section')
  })

  it('23b.3f. promotes text inside anonymous nested sections to the nearest durable section anchor', async () => {
    const imageUrl = 'https://images.pexels.com/photos/durable-section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'durable section background',
        source: 'pexels',
      },
    ])

    const durableSection = document.createElement('section')
    durableSection.id = 'durable_hero_section'
    durableSection.setAttribute('data-openui-var', 'home_hero')
    const anonymousSection = document.createElement('section')
    const headingElement = document.createElement('h1')
    headingElement.textContent = 'Nested hero title'
    anonymousSection.appendChild(headingElement)
    durableSection.appendChild(anonymousSection)
    document.body.appendChild(durableSection)

    const onStyleApply = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose: vi.fn(),
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select section' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'durable section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(durableSection.style.backgroundImage).toContain(imageUrl)
    expect(anonymousSection.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#durable_hero_section',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3g. commits data-openui-var as the durable style anchor when the selected section has no id or class', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/openui-var-section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'openui var section background',
        source: 'pexels',
      },
    ])

    const sectionElement = document.createElement('section')
    sectionElement.setAttribute('data-openui-var', 'home_hero')
    sectionElement.textContent = 'Hero section'
    document.body.appendChild(sectionElement)

    const { onStyleApply } = renderToolbar({
      activeElement: sectionElement,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'openui var section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(sectionElement.style.backgroundImage).toContain(imageUrl)
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '[data-openui-var="home_hero"]',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3h. can promote a selected child to the full page wrapper before applying a background image', async () => {
    const imageUrl = 'https://images.pexels.com/photos/page-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'full page background',
        source: 'pexels',
      },
    ])

    const pageElement = document.createElement('section')
    pageElement.setAttribute('data-sf-export-page', 'Home')
    const sectionElement = document.createElement('section')
    sectionElement.id = 'hero_section'
    const headingElement = document.createElement('h1')
    headingElement.textContent = 'Hero title'
    sectionElement.appendChild(headingElement)
    pageElement.appendChild(sectionElement)
    document.body.appendChild(pageElement)

    const onStyleApply = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose: vi.fn(),
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'full page background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(pageElement.style.backgroundImage).toContain(imageUrl)
    expect(sectionElement.style.backgroundImage).toBe('')
    expect(headingElement.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '[data-sf-export-page="Home"]',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3h.1 persists the DOM id before class and page markers for page-level styles', async () => {
    const imageUrl = 'https://images.pexels.com/photos/page-anchor-priority.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'page anchor priority',
        source: 'pexels',
      },
    ])

    const pageElement = document.createElement('section')
    pageElement.id = 'durable_page_root'
    pageElement.className = 'page-shell bg-paper'
    pageElement.setAttribute('data-sf-export-page', 'Home')
    const headingElement = document.createElement('h1')
    headingElement.textContent = 'Hero title'
    pageElement.appendChild(headingElement)
    document.body.appendChild(pageElement)

    const onStyleApply = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose: vi.fn(),
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'page anchor priority' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: '#durable_page_root',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3i. uses a page stack class before its legacy OpenUI marker when applying a background image', async () => {
    const imageUrl = 'https://images.pexels.com/photos/openui-page-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'openui page background',
        source: 'pexels',
      },
    ])

    const pageStackElement = document.createElement('div')
    pageStackElement.className = 'flex flex-col gap-4'
    pageStackElement.setAttribute('data-openui-component', 'Stack')
    pageStackElement.setAttribute('data-openui-var', 'home')
    const sectionWrapper = document.createElement('div')
    sectionWrapper.id = 'home_hero'
    const sectionElement = document.createElement('section')
    sectionElement.className = 'relative overflow-hidden bg-background'
    sectionElement.setAttribute('data-openui-component', 'MarketingAgencyHero')
    sectionElement.setAttribute('data-openui-var', 'home_hero')
    const headingElement = document.createElement('h1')
    headingElement.textContent = 'Hero title'
    sectionElement.appendChild(headingElement)
    sectionWrapper.appendChild(sectionElement)
    pageStackElement.appendChild(sectionWrapper)
    document.body.appendChild(pageStackElement)

    const onStyleApply = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose: vi.fn(),
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'openui page background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
    fireEvent.click(
      await screen.findByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(pageStackElement.style.backgroundImage).toContain(imageUrl)
    expect(sectionElement.style.backgroundImage).toBe('')
    expect(headingElement.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'flex flex-col gap-4',
        occurrenceIndex: 0,
        style: expect.stringContaining(imageUrl),
      }),
    )
  })

  it('23b.3j. uses a page stack class before its legacy OpenUI marker when applying a gradient background', async () => {
    const pageStackElement = document.createElement('div')
    pageStackElement.className = 'flex flex-col gap-4'
    pageStackElement.setAttribute('data-openui-component', 'Stack')
    pageStackElement.setAttribute('data-openui-var', 'home')
    const sectionWrapper = document.createElement('div')
    sectionWrapper.id = 'home_hero'
    const sectionElement = document.createElement('section')
    sectionElement.className = 'relative overflow-hidden bg-background'
    sectionElement.setAttribute('data-openui-component', 'MarketingAgencyHero')
    sectionElement.setAttribute('data-openui-var', 'home_hero')
    const headingElement = document.createElement('h1')
    headingElement.textContent = 'Hero title'
    sectionElement.appendChild(headingElement)
    sectionWrapper.appendChild(sectionElement)
    pageStackElement.appendChild(sectionWrapper)
    document.body.appendChild(pageStackElement)

    const onStyleApply = vi.fn()

    function Harness() {
      const [activeElement, setActiveElement] =
        useState<HTMLElement>(headingElement)
      return createElement(InlineEditToolbar, {
        isOpen: true,
        anchorRect,
        activeElement,
        onStyleApply,
        onCommitText: vi.fn(),
        onClose: vi.fn(),
        onSelectParentSection: setActiveElement,
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
      })
    }

    render(createElement(Harness))

    fireEvent.click(screen.getByRole('button', { name: 'Select page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.click(screen.getByRole('button', { name: 'Gradient' }))
    fireEvent.change(screen.getByLabelText('Gradient first color'), {
      target: { value: '#ff0000' },
    })
    fireEvent.change(screen.getByLabelText('Gradient second color'), {
      target: { value: '#0000ff' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(pageStackElement.style.backgroundImage).toContain('linear-gradient')
    expect(pageStackElement.style.backgroundImage).toContain('rgb(255, 0, 0)')
    expect(pageStackElement.style.backgroundImage).toContain('rgb(0, 0, 255)')
    expect(sectionElement.style.backgroundImage).toBe('')
    expect(headingElement.style.backgroundImage).toBe('')
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'flex flex-col gap-4',
        occurrenceIndex: 0,
        style: expect.stringContaining('linear-gradient'),
      }),
    )
  })

  it('23b.3a. expanded BG image controls keep Apply reachable when the toolbar would overflow the viewport', async () => {
    const originalInnerHeight = window.innerHeight
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight',
    )
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 360,
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return this instanceof HTMLElement &&
          this.hasAttribute('data-inline-edit-wrapper')
          ? 520
          : 0
      },
    })
    floatingStyleState.top = '260px'
    const imageUrl = 'https://images.pexels.com/photos/reachable-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'newsletter background',
        source: 'pexels',
      },
    ])

    try {
      const sectionElement = makeIdOnlySectionEl()
      const { onStyleApply } = renderToolbar({
        activeElement: sectionElement,
        sessionId: 'sess-1',
      })

      fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
      fireEvent.click(screen.getByRole('button', { name: 'BG' }))
      act(() => {
        for (const callback of resizeObserverCallbacks) {
          callback([], {} as ResizeObserver)
        }
      })

      const wrapper = document.querySelector(
        '[data-inline-edit-wrapper]',
      ) as HTMLElement
      await waitFor(() => {
        expect(wrapper.style.top).toBe('8px')
      })

      fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
        target: { value: 'newsletter background' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Search images' }))
      fireEvent.click(
        await screen.findByRole('button', { name: 'Select image 1' }),
      )

      const apply = screen.getByRole('button', { name: 'Apply' })
      expect((apply as HTMLButtonElement).disabled).toBe(false)
      fireEvent.click(apply)

      expect(onStyleApply).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceAnchor: '#newsletter_newsletter',
          occurrenceIndex: 0,
          style: expect.stringContaining(imageUrl),
        }),
      )
    } finally {
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      })
      if (originalOffsetHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          'offsetHeight',
          originalOffsetHeight,
        )
      } else {
        delete (HTMLElement.prototype as { offsetHeight?: unknown })
          .offsetHeight
      }
    }
  })

  it('23b.4. removing an img preview before Apply restores the original src without persisting a style edit', async () => {
    const imageUrl = 'https://images.pexels.com/photos/remove-preview.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onClose, onImageSelect, onStyleApply } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)

    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onStyleApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.5. removing a new section BG image before Apply closes without persisting an empty style edit', async () => {
    const imageUrl = 'https://images.pexels.com/photos/remove-section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'section background',
        source: 'pexels',
      },
    ])
    const sectionElement = makeSectionEl()
    const { onClose, onImageSelect, onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect(sectionElement.style.backgroundImage).toContain(imageUrl)

    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(sectionElement.getAttribute('style') ?? '').toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onStyleApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23b.6. removing an existing section BG image persists the cleared style', async () => {
    vi.mocked(window.getComputedStyle).mockReturnValue({
      ...fakeComputedStyle,
      backgroundImage:
        'url("https://images.pexels.com/photos/original-bg.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
    } as unknown as CSSStyleDeclaration)
    const sectionElement = makeSectionEl()
    sectionElement.style.backgroundImage =
      'url("https://images.pexels.com/photos/original-bg.jpeg")'
    sectionElement.style.backgroundSize = 'cover'
    sectionElement.style.backgroundPosition = 'center'
    const { onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledTimes(1)
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'hero-section bg-white py-20',
        style: '',
      }),
    )
  })

  it('23b.7. removing a class-provided section BG image persists an override instead of closing as unchanged', async () => {
    vi.mocked(window.getComputedStyle).mockReturnValue({
      ...fakeComputedStyle,
      backgroundImage: 'url("https://images.pexels.com/photos/class-bg.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
    } as unknown as CSSStyleDeclaration)
    const sectionElement = makeSectionEl()
    expect(sectionElement.getAttribute('style')).toBeNull()
    const { onClose, onStyleApply } = renderToolbar({
      activeElement: sectionElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))

    expect(sectionElement.style.backgroundImage).toBe('none')

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onStyleApply).toHaveBeenCalledTimes(1)
    expect(onStyleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAnchor: 'hero-section bg-white py-20',
        style: expect.stringContaining('background-image: none'),
      }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23c. closing after a BG image preview on an img reverts the original src', async () => {
    const imageUrl = 'https://images.pexels.com/photos/replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onImageSelect } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
    expect(onImageSelect).not.toHaveBeenCalled()
  })

  it('23d. escape after an image preview reverts the original src without saving', async () => {
    const imageUrl = 'https://images.pexels.com/photos/escape-replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onClose, onImageSelect } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23e. outside click after an image preview reverts the original src without saving', async () => {
    const imageUrl = 'https://images.pexels.com/photos/outside-replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onClose, onImageSelect } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    fireEvent.mouseDown(outside)

    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('23f. toggling the image panel closed reverts the preview without saving', async () => {
    const imageUrl = 'https://images.pexels.com/photos/toggle-replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { onClose, onImageSelect } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    const imageButton = screen.getByRole('button', { name: 'Swap image' })
    fireEvent.click(imageButton)
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)

    fireEvent.click(imageButton)

    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('23g. changing the active element after an image preview reverts the old image without saving', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/selection-change-replacement.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'replacement hero',
        source: 'pexels',
      },
    ])
    const firstImage = makeImageEl()
    const secondImage = makeImageEl()
    secondImage.setAttribute('src', 'https://example.com/second.png')
    const { onClose, onImageSelect, rerenderToolbar } = renderToolbar({
      activeElement: firstImage,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement hero' },
    })

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect((firstImage as HTMLImageElement).src).toBe(imageUrl)

    rerenderToolbar({ activeElement: secondImage })

    expect((firstImage as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
    expect((secondImage as HTMLImageElement).src).toBe(
      'https://example.com/second.png',
    )
    expect(onImageSelect).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('23g.0. reopening image search after switching images uses the new image context', async () => {
    const firstImage = makeImageEl()
    firstImage.alt = 'Craft beer taproom hero'
    const secondImage = makeImageEl()
    secondImage.alt = 'Seasonal release product bottle'
    const { rerenderToolbar } = renderToolbar({
      activeElement: firstImage,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    await waitFor(() => {
      expect(
        (
          screen.getByRole('textbox', {
            name: 'Search stock images',
          }) as HTMLInputElement
        ).value,
      ).toBe('Craft beer taproom hero')
    })

    rerenderToolbar({ activeElement: secondImage })
    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))

    await waitFor(() => {
      expect(
        (
          screen.getByRole('textbox', {
            name: 'Search stock images',
          }) as HTMLInputElement
        ).value,
      ).toBe('Seasonal release product bottle')
    })
  })

  it('23g.1. changing from an image to non-image selection closes the image panel instead of leaving empty expanded space', async () => {
    const firstImage = makeImageEl()
    const nextText = makeTextEl()
    const { container, rerenderToolbar } = renderToolbar({
      activeElement: firstImage,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    expect(screen.getByPlaceholderText('Search stock images...')).not.toBeNull()
    expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('1fr')

    rerenderToolbar({ activeElement: nextText })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Swap image' })).toBeNull()
      expect(screen.queryByPlaceholderText('Search stock images...')).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
  })

  it('23g.2. removing image selection capability while the image panel is open closes the panel', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/capability-lost-preview.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'capability lost preview',
        source: 'pexels',
      },
    ])
    const imageElement = makeImageEl()
    const { container, rerenderToolbar } = renderToolbar({
      activeElement: imageElement,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Swap image' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'capability lost preview' },
    })
    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)

    expect((imageElement as HTMLImageElement).src).toBe(imageUrl)
    expect(screen.getByPlaceholderText('Search stock images...')).not.toBeNull()
    expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('1fr')

    rerenderToolbar({ onImageSelect: undefined })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Swap image' })).toBeNull()
      expect(screen.queryByPlaceholderText('Search stock images...')).toBeNull()
      expect(findAnimatedPanel(container).style.gridTemplateRows).toBe('0fr')
    })
    expect((imageElement as HTMLImageElement).src).toBe(
      'https://example.com/orig.png',
    )
  })

  it('23h. changing the active element after a section background preview reverts the old style without saving', async () => {
    const imageUrl =
      'https://images.pexels.com/photos/selection-change-section-bg.jpeg'
    searchStockImagesMock.mockResolvedValue([
      {
        imageUrl,
        query: 'section background',
        source: 'pexels',
      },
    ])
    const firstSection = makeSectionEl()
    const secondSection = makeSectionEl()
    secondSection.className = 'pricing-section bg-slate-50 py-16'
    secondSection.style.backgroundColor = 'rgb(248, 250, 252)'
    const originalSecondStyle = secondSection.getAttribute('style')
    const { onClose, onStyleApply, rerenderToolbar } = renderToolbar({
      activeElement: firstSection,
      sessionId: 'sess-1',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Style controls' }))
    fireEvent.click(screen.getByRole('button', { name: 'BG' }))
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'section background' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search images' }))

    const result = await screen.findByRole('button', { name: 'Select image 1' })
    fireEvent.click(result)
    expect(firstSection.style.backgroundImage).toContain(imageUrl)

    rerenderToolbar({ activeElement: secondSection })

    expect(firstSection.getAttribute('style')).toBeNull()
    expect(secondSection.getAttribute('style')).toBe(originalSecondStyle)
    expect(onStyleApply).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
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

  // 26. Select parent — promote selection one DOM level up
  it('26a. shows a Select parent button that promotes to the immediate parent', () => {
    const wrapper = document.createElement('div')
    const child = document.createElement('div')
    wrapper.appendChild(child)
    document.body.appendChild(wrapper)
    const onSelectParent = vi.fn()

    renderToolbar({ activeElement: child, onSelectParent })

    fireEvent.click(screen.getByRole('button', { name: 'Select parent' }))
    expect(onSelectParent).toHaveBeenCalledWith(wrapper)
    wrapper.remove()
  })

  it('26b. hides Select parent at the preview boundary (nothing above to edit)', () => {
    const preview = document.createElement('div')
    preview.className = 'genui-preview'
    const pageRoot = document.createElement('div')
    preview.appendChild(pageRoot)
    document.body.appendChild(preview)

    renderToolbar({ activeElement: pageRoot, onSelectParent: vi.fn() })

    expect(screen.queryByRole('button', { name: 'Select parent' })).toBeNull()
    preview.remove()
  })

  it('26c. omits the button entirely when no onSelectParent handler is wired', () => {
    const wrapper = document.createElement('div')
    const child = document.createElement('div')
    wrapper.appendChild(child)
    document.body.appendChild(wrapper)

    renderToolbar({ activeElement: child })

    expect(screen.queryByRole('button', { name: 'Select parent' })).toBeNull()
    wrapper.remove()
  })
})
