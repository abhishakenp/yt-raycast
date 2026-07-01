// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Slider } from './slider'
import { Toggle } from './toggle'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('Radix-backed UI primitives', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('toggles aria-pressed state and calls the pressed-change handler', () => {
    const onPressedChange = vi.fn()
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )

    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(toggle)

    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it('keeps single toggle-group selection exclusive and announces pressed state', () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup
        type="single"
        defaultValue="desktop"
        onValueChange={onValueChange}
        aria-label="Viewport"
      >
        <ToggleGroupItem value="desktop" aria-label="Desktop">
          Desktop
        </ToggleGroupItem>
        <ToggleGroupItem value="mobile" aria-label="Mobile">
          Mobile
        </ToggleGroupItem>
      </ToggleGroup>,
    )

    const desktop = screen.getByRole('radio', { name: 'Desktop' })
    const mobile = screen.getByRole('radio', { name: 'Mobile' })

    expect(desktop.getAttribute('aria-checked')).toBe('true')
    expect(mobile.getAttribute('aria-checked')).toBe('false')

    fireEvent.click(mobile)

    expect(desktop.getAttribute('aria-checked')).toBe('false')
    expect(mobile.getAttribute('aria-checked')).toBe('true')
    expect(onValueChange).toHaveBeenCalledWith('mobile')
  })

  it('renders one slider thumb per provided value and forwards range attributes', () => {
    render(
      <Slider
        aria-label="Budget range"
        defaultValue={[25, 75]}
        min={10}
        max={100}
      />,
    )

    const sliders = screen.getAllByRole('slider')

    expect(document.querySelector('[data-slot="slider"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="slider-track"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="slider-range"]')).not.toBeNull()
    expect(sliders).toHaveLength(2)
    expect(
      sliders.map((slider) => slider.getAttribute('aria-valuemin')),
    ).toEqual(['10', '10'])
    expect(
      sliders.map((slider) => slider.getAttribute('aria-valuemax')),
    ).toEqual(['100', '100'])
    expect(
      sliders.map((slider) => slider.getAttribute('aria-valuenow')),
    ).toEqual(['25', '75'])
  })
})
