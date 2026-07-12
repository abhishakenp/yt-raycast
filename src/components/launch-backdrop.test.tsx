// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LaunchBackdrop } from './launch-backdrop'

function installMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

describe('LaunchBackdrop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    installMatchMedia(false)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders as decorative backdrop content with a full-screen canvas', () => {
    const { container } = render(<LaunchBackdrop />)

    const backdrop = container.firstElementChild as HTMLElement
    expect(backdrop.getAttribute('aria-hidden')).toBe('true')
    expect(backdrop.className).toContain('pointer-events-none')
    expect(backdrop.querySelector('canvas')).toBeTruthy()
  })

  it('does not start the canvas renderer for reduced-motion users', async () => {
    installMatchMedia(true)
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)

    render(<LaunchBackdrop />)

    await vi.advanceTimersByTimeAsync(2_000)

    expect(getContext).not.toHaveBeenCalled()
  })

  it('cancels delayed startup when the backdrop unmounts before idle time', async () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    const { unmount } = render(<LaunchBackdrop />)

    unmount()
    await vi.advanceTimersByTimeAsync(2_000)

    expect(getContext).not.toHaveBeenCalled()
  })

  it('starts the canvas renderer after the delayed idle window', async () => {
    const context = {
      beginPath: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      setTransform: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(_value: string) {},
      set globalAlpha(_value: number) {},
      set globalCompositeOperation(_value: string) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
    } as unknown as CanvasRenderingContext2D
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(context)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { container } = render(<LaunchBackdrop />)
    await vi.advanceTimersByTimeAsync(1_750)

    expect(getContext).toHaveBeenCalledWith('2d', { alpha: true })
    expect(context.setTransform).toHaveBeenCalled()
    expect(container.querySelector('canvas')).toBeTruthy()
  })
})
