// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StyleControlsPanel } from './StyleControlsPanel'

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
  render(createElement(StyleControlsPanel, { activeElement, onApply, onClose }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
    paddingTop: '10px',
    paddingRight: '10px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    marginTop: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    borderTopWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgb(0, 0, 0)',
    borderRadius: '4px',
    backgroundColor: 'rgb(255, 255, 255)',
    boxShadow: 'none',
    width: '100px',
    height: 'auto',
    ...overrides,
  }) as CSSStyleDeclaration

describe('StyleControlsPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    onApply.mockReset()
    onClose.mockReset()
    activeElement = document.createElement('div')
    activeElement.setAttribute('class', 'test-element')
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

  it('renders all 4 tabs', () => {
    const { getByLabelText } = renderPanel(activeElement)
    expect(getByLabelText('Spacing')).toBeTruthy()
    expect(getByLabelText('Border')).toBeTruthy()
    expect(getByLabelText('BG')).toBeTruthy()
    expect(getByLabelText('Size')).toBeTruthy()
  })

  it('switches to border tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))
    expect(getByText('Width')).toBeTruthy()
    expect(getByText('Style')).toBeTruthy()
    expect(getByText('Color')).toBeTruthy()
  })

  it('switches to background tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    expect(getByText('Shadow')).toBeTruthy()
  })

  it('switches to size tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))
    expect(getByText('Width')).toBeTruthy()
    expect(getByText('Height')).toBeTruthy()
  })

  it('apply calls onApply when style was modified via UI', () => {
    const { getByLabelText } = renderPanel(activeElement)
    // Switch to border tab
    fireEvent.click(getByLabelText('Border'))
    // Change border style select (triggers applyLiveStyle → markModified)
    const styleSelect = Array.from(document.querySelectorAll('select')).find(
      (s) => s.value === 'solid',
    )!
    fireEvent.change(styleSelect, { target: { value: 'dashed' } })
    expect(activeElement.style.borderStyle).toBe('dashed')
    // Click apply
    const applyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Apply'),
    )!
    fireEvent.click(applyBtn)
    expect(onApply).toHaveBeenCalledTimes(1)
    const payload = onApply.mock.calls[0][0]
    expect(payload.sourceAnchor).toBe('test-element')
    expect(payload.occurrenceIndex).toBe(0)
  })

  it('close reverts styles and calls onClose', () => {
    const originalStyle = 'color: red'
    activeElement.setAttribute('style', originalStyle)
    renderPanel(activeElement)
    // Modify style
    activeElement.style.setProperty('padding', '20px')
    // Click close
    const closeBtn = document.querySelector('button[aria-label="Close"]')!
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
    // Style should be reverted
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

  it('shadow presets apply box-shadow', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    const smBtn = getByText('sm')
    fireEvent.click(smBtn)
    expect(activeElement.style.boxShadow).toContain('0 1px 2px')
  })
})
