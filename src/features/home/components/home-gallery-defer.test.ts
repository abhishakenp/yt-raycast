// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LaunchBackdrop } from '@/components/launch-backdrop'

describe('homepage gallery deferral', () => {
  it('resolves the lazy home gallery import with HomeGallerySection', async () => {
    const module = await import('@/features/gallery/components/PublicGallery')

    expect(module.HomeGallerySection).toBeTypeOf('function')
  })

  it('exports the LaunchBackdrop component used by the homepage', () => {
    expect(LaunchBackdrop).toBeTypeOf('function')
  })

  describe('LaunchBackdrop visibility pause', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    let rafHandle = 0
    const cancelAnimationFrameSpy = vi.fn()

    beforeEach(() => {
      vi.useFakeTimers()
      rafHandle = 0
      vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameSpy)
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => ++rafHandle),
      )
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
        setTransform: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalCompositeOperation: '',
        globalAlpha: 1,
      }) as unknown as typeof originalGetContext
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
      HTMLCanvasElement.prototype.getContext = originalGetContext
      cancelAnimationFrameSpy.mockReset()
      cleanup()
    })

    it('pauses the animated canvas when the tab becomes hidden', () => {
      render(createElement(LaunchBackdrop))

      // Advance past the start delay (550ms) + idle fallback timeout (1200ms)
      // so initLaunchBackdrop runs and the rAF loop starts.
      vi.advanceTimersByTime(2000)

      // Animation loop is now running; simulate the tab being hidden.
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      })
      document.dispatchEvent(new Event('visibilitychange'))

      expect(cancelAnimationFrameSpy).toHaveBeenCalled()

      // Restore hidden state for subsequent tests.
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      })
    })
  })
})
