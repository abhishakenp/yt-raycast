// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LaunchBackdrop } from '@/components/launch-backdrop'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => createElement('a', { href: to, ...props }, children),
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      deleteMine: 'sessions.deleteMine',
    },
  },
}))

vi.mock('@/features/gallery/hooks/useGalleryController', () => ({
  useGalleryController: () => ({
    gallery: undefined,
  }),
}))

describe('homepage gallery deferral', () => {
  it('renders the deferred home gallery surface with loading cards and navigation links', async () => {
    const { HomeGallerySection } =
      await import('@/features/gallery/components/PublicGallery')

    const { container, getByRole, getByText } = render(
      createElement(HomeGallerySection),
    )

    expect(getByText('Gallery')).toBeTruthy()
    expect(getByRole('heading').textContent).toBe(
      'See what other speedsters generated',
    )
    expect(getByRole('link', { name: /my generations/i })).toHaveProperty(
      'pathname',
      '/mine',
    )
    expect(getByRole('link', { name: /view all/i })).toHaveProperty(
      'pathname',
      '/gallery',
    )
    expect(container.querySelector('.sf-gallery-grid')?.children).toHaveLength(
      12,
    )
  })

  it('renders the launch backdrop canvas layer used by the homepage', () => {
    const { container } = render(createElement(LaunchBackdrop))

    expect(container.querySelector('canvas')).not.toBeNull()
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
