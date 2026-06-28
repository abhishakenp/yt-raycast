// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TypographyControlsPanel } from './TypographyControlsPanel'

const onApply =
  vi.fn<
    (p: {
      sourceAnchor: string
      style: string
      occurrenceIndex: number
    }) => void
  >()
const onClose = vi.fn()

const renderPanel = (activeElement: HTMLElement) =>
  render(
    createElement(TypographyControlsPanel, { activeElement, onApply, onClose }),
  )

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
    onApply.mockReset()
    onClose.mockReset()
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
    const selects = Array.from(document.querySelectorAll('select'))
    const fontSelect = selects[0]
    expect(fontSelect).toBeTruthy()
    const options = Array.from(fontSelect.querySelectorAll('option'))
    expect(options.length).toBe(8)
    expect(options[0].textContent).toBe('System UI')
  })

  it('renders text transform buttons', () => {
    renderPanel(activeElement)
    const buttons = Array.from(document.querySelectorAll('button')).filter(
      (b) =>
        ['None', 'Upper', 'Lower', 'Cap'].includes(b.textContent?.trim() ?? ''),
    )
    expect(buttons.length).toBe(4)
  })

  it('font family change applies to element style', () => {
    renderPanel(activeElement)
    const fontSelect = Array.from(document.querySelectorAll('select'))[0]
    fireEvent.change(fontSelect, { target: { value: 'Georgia, serif' } })
    expect(activeElement.style.fontFamily).toBe('Georgia, serif')
  })

  it('text transform uppercase applies to element style', () => {
    renderPanel(activeElement)
    const upperBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Upper',
    )!
    fireEvent.click(upperBtn)
    expect(activeElement.style.textTransform).toBe('uppercase')
  })

  it('apply calls onApply with sourceAnchor and occurrenceIndex', () => {
    renderPanel(activeElement)
    // Modify via text transform button (click triggers applyLiveStyle → markModified)
    const upperBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Upper',
    )!
    fireEvent.click(upperBtn)
    expect(activeElement.style.textTransform).toBe('uppercase')
    // Click apply
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    expect(onApply).toHaveBeenCalledTimes(1)
    const payload = onApply.mock.calls[0][0]
    expect(payload.sourceAnchor).toBe('body-text')
    expect(payload.occurrenceIndex).toBe(0)
  })

  it('close reverts styles and calls onClose', () => {
    const originalStyle = 'color: blue'
    activeElement.setAttribute('style', originalStyle)
    renderPanel(activeElement)
    // Modify via UI
    const fontSelect = Array.from(document.querySelectorAll('select'))[0]
    fireEvent.change(fontSelect, { target: { value: 'Georgia, serif' } })
    // Close
    const closeBtn = document.querySelector('button[aria-label="Close"]')!
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(activeElement.getAttribute('style')).toBe(originalStyle)
  })

  it('apply without modifications just closes', () => {
    renderPanel(activeElement)
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    expect(onApply).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('line height auto toggle applies normal', () => {
    renderPanel(activeElement)
    const autoBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Auto',
    )!
    // Auto should be active by default (lineHeight is 'normal')
    expect(autoBtn).toBeTruthy()
    // Click it to toggle off, then back on
    fireEvent.click(autoBtn)
    // Now click again to re-enable auto
    fireEvent.click(autoBtn)
    expect(activeElement.style.lineHeight).toBe('normal')
  })
})
