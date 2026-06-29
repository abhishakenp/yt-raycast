// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Radix ToggleGroup requires ResizeObserver
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

vi.mock('@/lib/stock-image', () => ({
  searchStockImages: vi.fn(async () => []),
}))
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn(async () => {})),
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
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))

const { searchStockImages } = await import('@/lib/stock-image')
const { BackgroundPanel } = await import('./BackgroundPanel')

const onModified = vi.fn<() => void>()

const renderPanel = (activeElement: HTMLElement | null) =>
  render(createElement(BackgroundPanel, { activeElement, onModified }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
    backgroundColor: 'rgb(0, 0, 0)',
    backgroundImage: 'none',
    backgroundSize: '',
    backgroundPosition: '',
    backdropFilter: 'none',
    webkitBackdropFilter: 'none',
    ...overrides,
  }) as unknown as CSSStyleDeclaration

describe('BackgroundPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    onModified.mockReset()
    vi.mocked(searchStockImages).mockReset()
    vi.mocked(searchStockImages).mockResolvedValue([])
    activeElement = document.createElement('div')
    document.body.appendChild(activeElement)
    originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = vi.fn(() =>
      makeComputed(),
    ) as typeof window.getComputedStyle
  })

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle
    activeElement.remove()
    cleanup()
  })

  it('renders without crashing', () => {
    const { container } = renderPanel(activeElement)
    expect(container.firstChild).toBeTruthy()
  })

  it('applies background-color when solid color picker changes', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: '#000000' }),
    ) as typeof window.getComputedStyle
    const { getByDisplayValue } = renderPanel(activeElement)
    const colorInput = getByDisplayValue('#000000') as HTMLInputElement
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(activeElement.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(onModified).toHaveBeenCalled()
  })

  it('applies linear-gradient background-image in gradient mode', () => {
    const { getByText, getAllByRole } = renderPanel(activeElement)
    // Switch to gradient mode
    fireEvent.click(getByText('Gradient'))
    // The applied background-image should contain linear-gradient
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')
    // Verify a slider exists for angle (range inputs)
    const ranges = getAllByRole('slider')
    expect(ranges.length).toBeGreaterThan(0)
  })

  it('applies preset gradient when a preset swatch is clicked', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const sunset = getByLabelText('Sunset')
    fireEvent.click(sunset)
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')
    expect(activeElement.style.backgroundImage).toContain('rgb(255, 126, 95)')
    expect(onModified).toHaveBeenCalled()
  })

  it('backdrop blur slider renders', () => {
    const { getByLabelText } = renderPanel(activeElement)
    expect(getByLabelText('Backdrop blur')).toBeTruthy()
  })

  it('backdrop blur slider max is 100', () => {
    const { getByLabelText, getAllByRole } = renderPanel(activeElement)
    // The aria-label "Backdrop blur" is on the Radix Slider Root; the thumb
    // (role=slider) carries aria-valuemax. Scope thumb queries to the root.
    const blurRoot = getByLabelText('Backdrop blur')
    const thumbs = getAllByRole('slider')
    // Find the thumb contained within the backdrop blur slider root.
    const blurThumb = thumbs.find((t) => blurRoot.contains(t))
    expect(blurThumb).toBeTruthy()
    // Was 20 before the fix; should now be 100.
    expect(blurThumb?.getAttribute('aria-valuemax')).toBe('100')
  })
})
