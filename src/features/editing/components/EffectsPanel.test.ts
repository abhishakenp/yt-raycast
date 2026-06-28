// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
    const opacitySlider = getByLabelText('Opacity') as HTMLInputElement
    fireEvent.change(opacitySlider, { target: { value: '50' } })
    expect(activeElement.style.opacity).toBe('0.5')
    expect(onModified).toHaveBeenCalled()
  })

  it('blur filter applies filter with blur()', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const blurSlider = getByLabelText('Blur') as HTMLInputElement
    fireEvent.change(blurSlider, { target: { value: '4' } })
    expect(activeElement.style.filter).toContain('blur(4px)')
  })

  it('rotate transform applies transform with rotate()', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const rotateSlider = getByLabelText('Rotate') as HTMLInputElement
    fireEvent.change(rotateSlider, { target: { value: '45' } })
    expect(activeElement.style.transform).toContain('rotate(45deg)')
  })

  it('transition duration applies transition', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const durationSlider = getByLabelText('Duration') as HTMLInputElement
    fireEvent.change(durationSlider, { target: { value: '300' } })
    expect(activeElement.style.transition).toContain('300ms')
  })

  it('reset filters clears the filter property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const blurSlider = getByLabelText('Blur') as HTMLInputElement
    fireEvent.change(blurSlider, { target: { value: '5' } })
    expect(activeElement.style.filter).toContain('blur(5px)')
    fireEvent.click(getByLabelText('Reset filters'))
    expect(activeElement.style.filter).toBe('none')
  })

  it('reset transform clears the transform property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const rotateSlider = getByLabelText('Rotate') as HTMLInputElement
    fireEvent.change(rotateSlider, { target: { value: '90' } })
    expect(activeElement.style.transform).toContain('rotate(90deg)')
    fireEvent.click(getByLabelText('Reset transform'))
    expect(activeElement.style.transform).toBe('none')
  })

  it('reset transition clears the transition property', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const durationSlider = getByLabelText('Duration') as HTMLInputElement
    fireEvent.change(durationSlider, { target: { value: '200' } })
    expect(activeElement.style.transition).toContain('200ms')
    fireEvent.click(getByLabelText('Reset transition'))
    expect(activeElement.style.transition).toBe('none')
  })
})
