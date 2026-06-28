// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Radix Slider requires ResizeObserver
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

import { EffectsPanel } from './EffectsPanel'

const onModified = vi.fn<() => void>()

const renderPanel = (activeElement: HTMLElement) =>
  render(createElement(EffectsPanel, { activeElement, onModified }))

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
    opacity: '1',
    filter: 'none',
    transform: 'none',
    transition: 'all 0s ease 0s',
    ...overrides,
  }) as CSSStyleDeclaration

describe('EffectsPanel', () => {
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

  it('renders without crashing', () => {
    const { getByLabelText } = renderPanel(activeElement)
    expect(getByLabelText('Opacity')).toBeTruthy()
    expect(getByLabelText('Blur')).toBeTruthy()
    expect(getByLabelText('Rotate')).toBeTruthy()
    expect(getByLabelText('Duration')).toBeTruthy()
  })

  it('opacity slider applies opacity', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const opacitySlider = getByLabelText('Opacity')
    // Radix Slider: ArrowLeft decrements by step (100 → 99, opacity 0.99)
    fireEvent.keyDown(opacitySlider, { key: 'ArrowLeft' })
    expect(activeElement.style.opacity).toBe('0.99')
    expect(onModified).toHaveBeenCalled()
  })

  it('blur filter applies filter with blur()', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const blurSlider = getByLabelText('Blur')
    // Radix Slider: ArrowRight increments by step (0 → 0.1, blur(0.1px))
    fireEvent.keyDown(blurSlider, { key: 'ArrowRight' })
    expect(activeElement.style.filter).toContain('blur(0.1px)')
  })

  it('rotate transform applies transform with rotate()', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const rotateSlider = getByLabelText('Rotate')
    // Radix Slider: ArrowRight increments by step (0 → 1, rotate(1deg))
    fireEvent.keyDown(rotateSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transform).toContain('rotate(1deg)')
  })

  it('transition duration applies transition', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const durationSlider = getByLabelText('Duration')
    // Radix Slider: ArrowRight increments by step (0 → 50, 50ms)
    fireEvent.keyDown(durationSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transition).toContain('50ms')
  })

  it('reset filters clears the filter property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const blurSlider = getByLabelText('Blur')
    fireEvent.keyDown(blurSlider, { key: 'ArrowRight' })
    expect(activeElement.style.filter).toContain('blur(0.1px)')
    fireEvent.click(getByLabelText('Reset filters'))
    expect(activeElement.style.filter).toBe('none')
  })

  it('reset transform clears the transform property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const rotateSlider = getByLabelText('Rotate')
    fireEvent.keyDown(rotateSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transform).toContain('rotate(1deg)')
    fireEvent.click(getByLabelText('Reset transform'))
    expect(activeElement.style.transform).toBe('none')
  })

  it('reset transition clears the transition property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const durationSlider = getByLabelText('Duration')
    fireEvent.keyDown(durationSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transition).toContain('50ms')
    fireEvent.click(getByLabelText('Reset transition'))
    expect(activeElement.style.transition).toBe('none')
  })
})
