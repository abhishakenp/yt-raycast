// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TypographyControlsPanel } from './TypographyControlsPanel'

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

function renderPanel(activeElement: HTMLElement) {
  return render(
    createElement(TypographyControlsPanel, { activeElement, onModified }),
  )
}

function makeComputed(
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration {
  const values = {
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 'normal',
    letterSpacing: '0px',
    wordSpacing: '0px',
    textTransform: 'none',
    ...overrides,
  }
  return {
    ...values,
    getPropertyValue: (property) =>
      values[property as keyof typeof values] ?? '',
  } as CSSStyleDeclaration
}

describe('TypographyControlsPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    installPointerCapturePolyfill()
    onModified.mockReset()
    activeElement = document.createElement('p')
    activeElement.setAttribute('class', 'body-text')
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

  it('font family selection applies the selected font stack', () => {
    const { getByRole } = renderPanel(activeElement)

    const font = getByRole('combobox', { name: 'Font' })
    fireEvent.pointerDown(font, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'Georgia' }))

    expect(activeElement.style.fontFamily).toBe('Georgia, serif')
    expect(onModified).toHaveBeenCalled()
  })

  it('font weight selection applies the selected numeric weight', () => {
    const { getByRole } = renderPanel(activeElement)

    const weight = getByRole('combobox', { name: 'Weight' })
    fireEvent.pointerDown(weight, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'Bold' }))

    expect(activeElement.style.fontWeight).toBe('700')
    expect(onModified).toHaveBeenCalled()
  })

  it('exposes typography controls by accessible name', () => {
    const { getByRole } = renderPanel(activeElement)

    expect(getByRole('combobox', { name: 'Font' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Weight' })).toBeTruthy()
    expect(getByRole('spinbutton', { name: 'Line height' })).toBeTruthy()
    expect(getByRole('button', { name: 'Auto line height' })).toBeTruthy()
    expect(getByRole('spinbutton', { name: 'Letter spacing' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Letter spacing unit' })).toBeTruthy()
    expect(getByRole('spinbutton', { name: 'Word spacing' })).toBeTruthy()
    expect(getByRole('combobox', { name: 'Word spacing unit' })).toBeTruthy()
    expect(getByRole('radio', { name: 'Upper' })).toBeTruthy()
  })

  it('labels the case toggle group so transform options have context', () => {
    const { getByRole } = renderPanel(activeElement)

    expect(getByRole('radiogroup', { name: 'Case' })).toBeTruthy()
  })

  it('renders text transform toggle group items', () => {
    renderPanel(activeElement)
    const items = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).filter((b) =>
      ['None', 'Upper', 'Lower', 'Cap'].includes(b.textContent?.trim() ?? ''),
    )
    expect(items.length).toBe(4)
  })

  it('letter spacing change applies to element style', () => {
    renderPanel(activeElement)
    // Use native number input (letter spacing) instead of Radix Select
    const letterInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.step === '0.01')!
    fireEvent.change(letterInput, { target: { value: '0.05' } })
    expect(activeElement.style.letterSpacing).toBe('0.05em')
  })

  it('letter spacing unit change reapplies the existing value with the new unit', () => {
    const { getByRole } = renderPanel(activeElement)
    const letterInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.getAttribute('aria-label') === 'Letter spacing')!
    fireEvent.change(letterInput, { target: { value: '0.05' } })

    const unit = getByRole('combobox', { name: 'Letter spacing unit' })
    fireEvent.pointerDown(unit, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'px' }))

    expect(activeElement.style.letterSpacing).toBe('0.05px')
    expect(onModified).toHaveBeenCalled()
  })

  it('word spacing unit change reapplies the existing value with the new unit', () => {
    const { getByRole } = renderPanel(activeElement)
    const wordInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.getAttribute('aria-label') === 'Word spacing')!
    fireEvent.change(wordInput, { target: { value: '0.25' } })

    const unit = getByRole('combobox', { name: 'Word spacing unit' })
    fireEvent.pointerDown(unit, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'px' }))

    expect(activeElement.style.wordSpacing).toBe('0.25px')
    expect(onModified).toHaveBeenCalled()
  })

  it('text transform uppercase applies to element style', () => {
    renderPanel(activeElement)
    const upperBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Upper')!
    fireEvent.click(upperBtn)
    expect(activeElement.style.textTransform).toBe('uppercase')
  })

  it('modifying text transform calls onModified', () => {
    renderPanel(activeElement)
    const upperBtn = Array.from(
      document.querySelectorAll('[role="radio"]'),
    ).find((b) => b.textContent?.trim() === 'Upper')!
    fireEvent.click(upperBtn)
    expect(activeElement.style.textTransform).toBe('uppercase')
    expect(onModified).toHaveBeenCalled()
  })

  it('line height auto toggle applies normal', () => {
    renderPanel(activeElement)
    const autoBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Auto',
    )!
    expect(autoBtn).toBeTruthy()
    // Click it to toggle off, then back on
    fireEvent.click(autoBtn)
    // Now click again to re-enable auto
    fireEvent.click(autoBtn)
    expect(activeElement.style.lineHeight).toBe('normal')
  })
})
