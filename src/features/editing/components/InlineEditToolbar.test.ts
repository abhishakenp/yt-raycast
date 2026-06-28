// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InlineEditToolbar } from './InlineEditToolbar'

/**
 * Minimal DOMRect stand-in. jsdom's DOMRect constructor exists but the toolbar
 * only reads `left`/`top`, so a plain object is enough and avoids relying on
 * jsdom geometry support.
 */
const makeRect = (): DOMRect =>
  ({
    left: 100,
    top: 200,
    right: 200,
    bottom: 240,
    width: 100,
    height: 40,
    x: 100,
    y: 200,
    toJSON: () => ({}),
  }) as DOMRect

/**
 * Fake computed style returned for the edited element. The toolbar reads only a
 * handful of properties, so a partial object cast to CSSStyleDeclaration is
 * sufficient and keeps the test independent of jsdom's style resolver.
 */
const makeComputed = (
  overrides: Partial<{ textAlign: string }> = {},
): CSSStyleDeclaration =>
  ({
    fontSize: '16px',
    fontWeight: '400',
    fontStyle: 'normal',
    color: 'rgb(0,0,0)',
    textAlign: 'start',
    ...overrides,
  }) as CSSStyleDeclaration

const onStyleApply =
  vi.fn<
    (payload: {
      sourceAnchor: string
      style: string
      occurrenceIndex: number
    }) => void
  >()
const onCommitText = vi.fn()
const onClose = vi.fn()

const renderToolbar = (activeElement: HTMLElement) =>
  render(
    createElement(InlineEditToolbar, {
      isOpen: true,
      anchorRect: makeRect(),
      activeElement,
      onStyleApply,
      onCommitText,
      onClose,
      isApplying: false,
      isForking: false,
    }),
  )

describe('InlineEditToolbar — behavioral', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame

  beforeEach(() => {
    onStyleApply.mockReset()
    onCommitText.mockReset()
    onClose.mockReset()

    activeElement = document.createElement('div')
    document.body.appendChild(activeElement)

    originalGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() =>
      makeComputed(),
    )

    // Run rAF callbacks synchronously so styleReadCompleteRef flips true right
    // after the initial computed-style read effect, enabling the live-preview
    // effect when the user later modifies a control.
    originalRequestAnimationFrame = globalThis.requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    cleanup()
    activeElement.remove()
    vi.mocked(window.getComputedStyle).mockRestore()
    window.getComputedStyle = originalGetComputedStyle
    vi.stubGlobal('requestAnimationFrame', originalRequestAnimationFrame)
  })

  it('restores the original style attribute when Close is clicked', () => {
    activeElement.setAttribute('style', 'color: red')
    renderToolbar(activeElement)

    // Simulate the live-preview having mutated the element's inline style.
    activeElement.setAttribute('style', 'color: blue; font-weight: 700')
    expect(activeElement.getAttribute('style')).toBe(
      'color: blue; font-weight: 700',
    )

    fireEvent.click(screenlessCloseButton())

    expect(activeElement.getAttribute('style')).toBe('color: red')
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onStyleApply).not.toHaveBeenCalled()
  })

  it('removes the style attribute entirely when the element had none originally', () => {
    // No style attribute on mount → originalStyleRef is null → handleClose
    // calls removeAttribute('style').
    renderToolbar(activeElement)

    activeElement.setAttribute('style', 'color: blue')
    fireEvent.click(screenlessCloseButton())

    expect(activeElement.getAttribute('style')).toBeNull()
  })

  it('does NOT restore the original style on Apply; commits the live style instead', () => {
    activeElement.setAttribute('style', 'color: red')
    renderToolbar(activeElement)

    // Mark the user as having modified a control so handleApply takes the
    // save path (it early-returns when nothing was modified).
    fireEvent.click(boldButton())

    const liveStyle = activeElement.getAttribute('style') ?? ''
    expect(liveStyle).not.toBe('color: red')

    fireEvent.click(applyButton())

    // Style is left as the live (modified) value — handleApply never restores.
    expect(activeElement.getAttribute('style')).toBe(liveStyle)
    expect(onStyleApply).toHaveBeenCalledTimes(1)
    expect(onStyleApply.mock.calls[0][0].style).toBe(liveStyle)
    expect(onCommitText).toHaveBeenCalledTimes(1)
    // Apply does not call onClose itself; the parent closes after saving.
    expect(onClose).not.toHaveBeenCalled()
  })

  it('maps computed textAlign "start" to the left alignment control', () => {
    vi.mocked(window.getComputedStyle).mockImplementation(() =>
      makeComputed({ textAlign: 'start' }),
    )
    renderToolbar(activeElement)

    // The "Align left" button should be the active (selected) one, reflecting
    // internal alignment state derived from the computed "start" value.
    expect(leftAlignButton().className).toContain('bg-cyan-300/20')
    expect(centerAlignButton().className).not.toContain('bg-cyan-300/20')
  })

  it('maps computed textAlign "center" to the center alignment control', () => {
    vi.mocked(window.getComputedStyle).mockImplementation(() =>
      makeComputed({ textAlign: 'center' }),
    )
    renderToolbar(activeElement)

    expect(centerAlignButton().className).toContain('bg-cyan-300/20')
    expect(leftAlignButton().className).not.toContain('bg-cyan-300/20')
  })

  // --- button lookups (kept inline to avoid importing screen for .ts) ---
  const screenlessCloseButton = () =>
    document.querySelector('button[aria-label="Close"]') as HTMLButtonElement
  const boldButton = () =>
    document.querySelector('button[aria-label="Bold"]') as HTMLButtonElement
  const applyButton = () => {
    const buttons = Array.from(
      document.querySelectorAll('button'),
    ) as HTMLButtonElement[]
    return buttons.find((b) => b.textContent?.includes('Apply'))!
  }
  const leftAlignButton = () =>
    document.querySelector(
      'button[aria-label="Align left"]',
    ) as HTMLButtonElement
  const centerAlignButton = () =>
    document.querySelector(
      'button[aria-label="Align center"]',
    ) as HTMLButtonElement
})

describe('InlineEditToolbar — font size dropdown', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame

  beforeEach(() => {
    onStyleApply.mockReset()
    onCommitText.mockReset()
    onClose.mockReset()

    activeElement = document.createElement('div')
    activeElement.setAttribute('class', 'hero-title')
    document.body.appendChild(activeElement)

    originalGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() =>
      makeComputed(),
    )

    originalRequestAnimationFrame = globalThis.requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    cleanup()
    activeElement.remove()
    vi.mocked(window.getComputedStyle).mockRestore()
    window.getComputedStyle = originalGetComputedStyle
    vi.stubGlobal('requestAnimationFrame', originalRequestAnimationFrame)
  })

  it('applies font size to the element when the dropdown value changes', () => {
    renderToolbar(activeElement)

    // The dropdown should reflect the computed 16px initially
    const select = document.querySelector('select') as HTMLSelectElement
    expect(select.value).toBe('16')

    // Simulate user selecting 24px
    fireEvent.change(select, { target: { value: '24' } })

    // The live-preview effect should have applied 24px to the element
    expect(activeElement.style.fontSize).toBe('24px')
  })

  it('does NOT preventDefault on mousedown for the font-size select (dropdown must open)', () => {
    // The toolbar parent has onMouseDown={preventFocusSteal} which calls
    // e.preventDefault() to keep focus on the contentEditable. But native
    // <select> dropdowns REQUIRE the mousedown default to open. If
    // preventDefault fires on the select, the dropdown never opens and the
    // user can't change font size.
    renderToolbar(activeElement)

    const select = document.querySelector('select') as HTMLSelectElement
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    select.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('does NOT preventDefault on mousedown for the color input', () => {
    // Same issue: <input type="color"> needs mousedown default to open
    renderToolbar(activeElement)

    const input = document.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    input.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('sends the updated font size in onStyleApply when Apply is clicked', () => {
    // CSS / CSS.escape is not available in jsdom — polyfill it so handleApply
    // can compute occurrenceIndex via querySelectorAll.
    const globalCss = globalThis as unknown as {
      CSS?: { escape?: (s: string) => string }
    }
    if (!globalCss.CSS) globalCss.CSS = {} as { escape: (s: string) => string }
    if (!globalCss.CSS!.escape) {
      globalCss.CSS!.escape = (str: string) => str.replace(/[^\w-]/g, '\\$&')
    }

    renderToolbar(activeElement)

    const select = document.querySelector('select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: '32' } })

    const buttons = Array.from(
      document.querySelectorAll('button'),
    ) as HTMLButtonElement[]
    const apply = buttons.find((b) => b.textContent?.includes('Apply'))!
    fireEvent.click(apply)

    expect(onStyleApply).toHaveBeenCalledTimes(1)
    const { style } = onStyleApply.mock.calls[0][0]
    expect(style).toContain('font-size: 32px')
  })
})
