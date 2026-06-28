// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StyleControlsPanel } from './StyleControlsPanel'

const onModified = vi.fn<() => void>()

const renderPanel = (activeElement: HTMLElement) =>
  render(createElement(StyleControlsPanel, { activeElement, onModified }))

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
    onModified.mockReset()
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
    expect(getByText('Style')).toBeTruthy()
    expect(getByText('Color')).toBeTruthy()
  })

  it('switches to background tab', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    expect(getByText('Shadow')).toBeTruthy()
  })

  it('switches to size tab', () => {
    const { getByLabelText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Size'))
    // Size tab has W and H labels (shortened from Width/Height)
    const inputs = document.querySelectorAll('input[type="text"]')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('modifying border width calls onModified and applies live style', () => {
    const { getByLabelText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('Border'))
    const widthInput = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
    ).find((i) => i.value === '1')!
    fireEvent.change(widthInput, { target: { value: '3' } })
    expect(activeElement.style.borderWidth).toBe('3px')
    expect(onModified).toHaveBeenCalled()
  })

  it('shadow presets apply box-shadow', () => {
    const { getByLabelText, getByText } = renderPanel(activeElement)
    fireEvent.click(getByLabelText('BG'))
    const smBtn = getByText('sm')
    fireEvent.click(smBtn)
    expect(activeElement.style.boxShadow).toContain('0 1px 2px')
  })
})
