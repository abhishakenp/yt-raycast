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

const installPointerCapturePolyfill = () => {
  for (const [name, value] of [
    ['hasPointerCapture', () => false],
    ['setPointerCapture', () => undefined],
    ['releasePointerCapture', () => undefined],
  ] as const) {
    if (!(name in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype, name, {
        configurable: true,
        value,
      })
    }
  }
}

const renderPanel = (activeElement: HTMLElement) =>
  render(createElement(LayoutPanel, { activeElement, onModified }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration => {
  const values = {
    display: 'block',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '0px',
    flexWrap: 'nowrap',
    ...overrides,
  }
  return {
    ...values,
    getPropertyValue: (property: string) =>
      values[property as keyof typeof values] ?? '',
  } as CSSStyleDeclaration
}

describe('LayoutPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    installPointerCapturePolyfill()
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
    expect(
      Array.from(document.querySelectorAll('[role="radio"]')).map((node) =>
        node.textContent?.trim(),
      ),
    ).toEqual(expect.arrayContaining(['Block', 'Flex']))
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

  it('gap unit change reapplies the existing value with the new unit', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)
    const gapInput = getByRole('spinbutton', { name: 'Gap' })
    fireEvent.change(gapInput, { target: { value: '12' } })

    const unit = getByRole('combobox', { name: 'Gap unit' })
    fireEvent.pointerDown(unit, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'rem' }))

    expect(activeElement.style.gap).toBe('12rem')
    expect(onModified).toHaveBeenCalled()
  })

  it('exposes flex gap controls by accessible name', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)

    expect(getByRole('spinbutton', { name: 'Gap' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Gap unit' })).toBeTruthy()
  })

  it('labels layout toggle groups so repeated options are unambiguous', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ display: 'flex' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)

    expect(getByRole('radiogroup', { name: 'Display' })).toBeTruthy()
    expect(getByRole('radiogroup', { name: 'Direction' })).toBeTruthy()
    expect(getByRole('radiogroup', { name: 'Justify' })).toBeTruthy()
    expect(getByRole('radiogroup', { name: 'Align' })).toBeTruthy()
    expect(getByRole('radiogroup', { name: 'Wrap' })).toBeTruthy()
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
