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

import { LayoutPanel } from './LayoutPanel'

const onModified = vi.fn<() => void>()

const renderPanel = (activeElement: HTMLElement) =>
  render(createElement(LayoutPanel, { activeElement, onModified }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
    display: 'block',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '0px',
    flexWrap: 'nowrap',
    ...overrides,
  }) as CSSStyleDeclaration

describe('LayoutPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    onModified.mockReset()
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
    renderPanel(activeElement)
    expect(document.body).toBeTruthy()
  })

  it('toggling to Flex mode applies display: flex', () => {
    renderPanel(activeElement)
    const flexBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Flex')!
    expect(flexBtn).toBeTruthy()
    fireEvent.click(flexBtn)
    expect(activeElement.style.display).toBe('flex')
  })

  it('flex direction toggle applies flex-direction', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    renderPanel(activeElement)
    // Direction items are icon-only; select the column item by aria-label
    const columnBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.getAttribute('aria-label') === 'Column')!
    expect(columnBtn).toBeTruthy()
    fireEvent.click(columnBtn)
    expect(activeElement.style.flexDirection).toBe('column')
  })

  it('justify content toggle applies justify-content', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    renderPanel(activeElement)
    const centerBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Center')!
    // First Center is justify-content (appears before align-items)
    expect(centerBtn).toBeTruthy()
    fireEvent.click(centerBtn)
    expect(activeElement.style.justifyContent).toBe('center')
  })

  it('align items toggle applies align-items', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex', alignItems: 'flex-start' }),
    ) as typeof window.getComputedStyle
    renderPanel(activeElement)
    // align-items "Stretch" is unique to the align toggle group
    const stretchBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Stretch')!
    expect(stretchBtn).toBeTruthy()
    fireEvent.click(stretchBtn)
    expect(activeElement.style.alignItems).toBe('stretch')
  })

  it('gap input applies gap', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    renderPanel(activeElement)
    const gapInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.value === '0')!
    expect(gapInput).toBeTruthy()
    fireEvent.change(gapInput, { target: { value: '12' } })
    expect(activeElement.style.gap).toBe('12px')
  })

  it('flex wrap toggle applies flex-wrap', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    renderPanel(activeElement)
    const wrapBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Wrap')!
    expect(wrapBtn).toBeTruthy()
    fireEvent.click(wrapBtn)
    expect(activeElement.style.flexWrap).toBe('wrap')
  })
})
