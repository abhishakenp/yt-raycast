// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Slider } from './slider'

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

describe('Slider', () => {
  afterEach(() => cleanup())

  it('names the accessible slider thumb from aria-label', () => {
    render(<Slider aria-label="Backdrop blur" value={[24]} />)

    const thumb = screen.getByRole('slider', { name: 'Backdrop blur' })

    expect(thumb.getAttribute('aria-valuenow')).toBe('24')
  })

  it('keeps multiple thumbs distinguishable when a labelled range has two values', () => {
    render(<Slider aria-label="Price range" value={[20, 80]} />)

    expect(screen.getByRole('slider', { name: 'Price range 1' })).toBeTruthy()
    expect(screen.getByRole('slider', { name: 'Price range 2' })).toBeTruthy()
  })
})
