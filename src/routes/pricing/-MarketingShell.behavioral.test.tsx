// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const router = vi.hoisted(() => ({
  preloadRoute: vi.fn(async () => undefined),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useRouter: () => router,
}))

vi.mock('@/components/TopActions', () => ({
  TopActions: () => <div data-testid="top-actions" />,
}))

vi.mock('@/features/home/components/GlassPill', () => ({
  GlassDefs: () => <svg data-testid="glass-defs" />,
}))

vi.mock('@/routes/index', () => ({}))
vi.mock('@/features/home/components/HomePage', () => ({}))
vi.mock('@/features/gallery/components/PublicGallery', () => ({}))
vi.mock('@/routes/pricing', () => ({}))
vi.mock('@/routes/pricing/-PricingPage', () => ({}))

import { MarketingShell } from './-MarketingShell'

describe('MarketingShell', () => {
  beforeEach(() => {
    router.preloadRoute.mockClear()
    vi.stubGlobal(
      'Image',
      vi.fn(function Image(this: { decoding?: string; src?: string }) {
        return this
      }),
    )
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: Promise.resolve(),
        load: vi.fn(async () => []),
      },
    })
  })

  afterEach(() => {
    cleanup()
    document.body.className = ''
    vi.unstubAllGlobals()
  })

  it('renders marketing chrome and footer links without blocking the first paint', () => {
    const view = render(
      <MarketingShell footer>
        <main>Terms content</main>
      </MarketingShell>,
    )

    expect(view.getByText('Terms content')).toBeTruthy()
    expect(view.getByLabelText('SHIP FAST home').getAttribute('href')).toBe('/')
    expect(view.getByRole('contentinfo')).toBeTruthy()
    expect(
      view.getByRole('link', { name: 'Pricing' }).getAttribute('href'),
    ).toBe('/pricing')
    expect(document.body.classList.contains('sf-marketing-page')).toBe(true)
    expect(router.preloadRoute).not.toHaveBeenCalled()
  })

  it('prewarms internal routes, image, and fonts after idle', async () => {
    const requestIdleCallback = vi.fn((callback) => {
      callback({ didTimeout: false, timeRemaining: () => 8 })
      return 42
    })
    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallback,
    })
    Object.defineProperty(window, 'cancelIdleCallback', {
      configurable: true,
      value: vi.fn(),
    })

    const view = render(
      <MarketingShell>
        <main>Pricing content</main>
      </MarketingShell>,
    )

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 725))
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(requestIdleCallback).toHaveBeenCalled()
    expect(router.preloadRoute).toHaveBeenCalledWith({ to: '/' })
    expect(router.preloadRoute).toHaveBeenCalledWith({ to: '/pricing' })
    expect(vi.mocked(Image)).toHaveBeenCalled()
    expect(document.fonts.load).toHaveBeenCalledWith('1em Archivo Black')
    expect(document.fonts.load).toHaveBeenCalledWith('1em JetBrains Mono')

    view.unmount()
    expect(document.body.classList.contains('sf-marketing-page')).toBe(false)
  })
})
