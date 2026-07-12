// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}
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

import { EffectsPanel } from './EffectsPanel'

const onModified = vi.fn<() => void>()

function renderPanel(activeElement: HTMLElement) {
  return render(createElement(EffectsPanel, { activeElement, onModified }))
}

function makeComputed(
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration {
  return {
    opacity: '1',
    filter: 'none',
    transform: 'none',
    transition: 'all 0s ease 0s',
    ...overrides,
    getPropertyValue(prop: string) {
      return (this as unknown as Record<string, string>)[prop] ?? ''
    },
  } as CSSStyleDeclaration
}

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

  it('combines brightness, contrast, saturate, and grayscale into one filter style', () => {
    const { getByLabelText } = renderPanel(activeElement)

    fireEvent.keyDown(getByLabelText('Brightness'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByLabelText('Contrast'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByLabelText('Saturate'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByLabelText('Grayscale'), { key: 'ArrowRight' })

    expect(activeElement.style.filter).toContain('brightness(101%)')
    expect(activeElement.style.filter).toContain('contrast(101%)')
    expect(activeElement.style.filter).toContain('saturate(101%)')
    expect(activeElement.style.filter).toContain('grayscale(1%)')
    expect(onModified).toHaveBeenCalled()
  })

  it('rotate transform applies transform with rotate()', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const rotateSlider = getByLabelText('Rotate')
    // Radix Slider: ArrowRight increments by step (0 → 1, rotate(1deg))
    fireEvent.keyDown(rotateSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transform).toContain('rotate(1deg)')
  })

  it('combines scale, skew, and translate into one transform style', () => {
    const { getByLabelText } = renderPanel(activeElement)

    fireEvent.keyDown(getByLabelText('Scale'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByLabelText('Skew X'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByLabelText('Skew Y'), { key: 'ArrowRight' })
    fireEvent.change(getByLabelText('Translate X'), { target: { value: '24' } })
    fireEvent.change(getByLabelText('Translate Y'), {
      target: { value: '-16' },
    })

    expect(activeElement.style.transform).toContain('scale(1.1)')
    expect(activeElement.style.transform).toContain('skew(1deg, 1deg)')
    expect(activeElement.style.transform).toContain('translate(24px, -16px)')
    expect(onModified).toHaveBeenCalled()
  })

  it('hydrates translate controls from browser-computed matrix transforms', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ transform: 'matrix(1, 0, 0, 1, 24, -16)' }),
    ) as typeof window.getComputedStyle

    renderPanel(activeElement)

    expect(
      (screen.getByLabelText('Translate X') as HTMLInputElement).value,
    ).toBe('24')
    expect(
      (screen.getByLabelText('Translate Y') as HTMLInputElement).value,
    ).toBe('-16')
  })

  it('transition duration applies transition', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const durationSlider = getByLabelText('Duration')
    // Radix Slider: ArrowRight increments by step (0 → 50, 50ms)
    fireEvent.keyDown(durationSlider, { key: 'ArrowRight' })
    expect(activeElement.style.transition).toContain('50ms')
  })

  it('transition easing and property selections update the transition style', () => {
    const { getByRole } = renderPanel(activeElement)

    const easing = getByRole('combobox', { name: 'Transition easing' })
    fireEvent.pointerDown(easing, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'linear' }))

    const property = getByRole('combobox', { name: 'Transition property' })
    fireEvent.pointerDown(property, {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    })
    fireEvent.click(getByRole('option', { name: 'opacity' }))

    expect(activeElement.style.transition).toBe('opacity 0ms linear')
    expect(onModified).toHaveBeenCalled()
  })

  it('reads second-based transitions as milliseconds and names transition selects', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ transition: 'opacity 0.2s ease-in-out 0s' }),
    ) as typeof window.getComputedStyle

    renderPanel(activeElement)

    expect(screen.getByText('200ms')).toBeTruthy()
    expect(
      screen.getByRole('combobox', { name: 'Transition easing' }).textContent,
    ).toContain('ease-in-out')
    expect(
      screen.getByRole('combobox', { name: 'Transition property' }).textContent,
    ).toContain('opacity')
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
