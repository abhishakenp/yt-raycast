// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TypographyControlsPanel } from './TypographyControlsPanel'

const onModified = vi.fn<() => void>()

const renderPanel = (activeElement: HTMLElement) =>
  render(createElement(TypographyControlsPanel, { activeElement, onModified }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 'normal',
    letterSpacing: '0px',
    wordSpacing: '0px',
    textTransform: 'none',
    ...overrides,
  }) as CSSStyleDeclaration

describe('TypographyControlsPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
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

  it('renders font family select with options', () => {
    renderPanel(activeElement)
    // Radix Select renders a combobox trigger, not a native <select>
    const trigger = document.querySelector('[role="combobox"]')
    expect(trigger).toBeTruthy()
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
