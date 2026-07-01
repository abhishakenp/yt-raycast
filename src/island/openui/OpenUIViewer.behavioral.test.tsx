// @vitest-environment jsdom
//
// Behavioral tests for OpenUIViewer: streaming skeleton, first-paint detection,
// error boundary, runtime library caching, AI capsule injection, Medusa sync +
// polling, embed/preview styling, theme CSS-var injection, locale/image-context
// propagation, empty source, source change, and rapid source-change cancellation.
//
// Philosophy: assert EXPECTED/CORRECT behavior. If the code is buggy, the test
// MUST fail — we do not pin current (broken) behavior.
//
// No jest-dom matchers are configured in this project — assertions use
// .toBeTruthy()/.toBeNull()/.toHaveBeenCalled() and direct DOM inspection
// (.style, .querySelector, .getAttribute) instead of toBeInTheDocument etc.
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mock state ─────────────────────────────────────────────────────
// vi.hoisted runs before any import / vi.mock factory evaluation so the mock
// objects below are available inside every vi.mock factory.
const state = vi.hoisted(() => ({
  // Runtime library loader — controllable per test (resolved / pending / throw).
  loadOpenUIRuntimeLibrary: vi.fn(),
  // Convex useQuery return value (undefined = loading, [] = loaded empty, rows = capsules).
  useQuery: vi.fn(),
  // Medusa preview DOM applier spy.
  applyMedusaProductsToPreviewDom: vi.fn(),
  // Generated commerce product extractor (controls whether Medusa sync runs).
  extractGeneratedCommerceProducts: vi.fn(() => [] as unknown[]),
  // Renderer behavior: 'content' renders real DOM text, 'img' renders an <img>,
  // 'throw' simulates a renderer crash for the error-boundary test.
  rendererMode: 'content' as 'content' | 'img' | 'throw',
  // Captured locale prop passed to I18nProvider.
  i18nLocale: null as string | null,
  // Captured value prop passed to ImageContextProvider.
  imageContextValue: undefined as unknown,
}))

// ─── Module mocks ───────────────────────────────────────────────────────────

// Mock @ship-fast/blocks/runtime: pass-through providers, a controllable
// Renderer that renders real DOM, and a real cache-key function so source
// changes produce different keys (drives effect re-runs / library reloads).
vi.mock('@ship-fast/blocks/runtime', () => ({
  BrandLogoProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  ImageContextProvider: ({
    children,
    value,
  }: {
    children: ReactNode
    value?: unknown
  }) => {
    state.imageContextValue = value
    return <>{children}</>
  },
  OpenUIIntegrationProviders: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  QueryClient: class QueryClient {
    constructor() {}
  },
  QueryClientProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  Renderer: ({
    response,
  }: {
    response: string
    library: unknown
    isStreaming?: boolean
  }) => {
    if (state.rendererMode === 'throw') {
      throw new Error('renderer boom')
    }
    if (state.rendererMode === 'img') {
      return (
        <article>
          <h2>Store</h2>
          <img src="https://example.com/hero.jpg" alt="hero product" />
        </article>
      )
    }
    // content mode — render the response text plus filler so innerText > 80
    // chars (satisfies the first-paint isPainted() text-length threshold).
    return (
      <article>
        <h2>{response}</h2>
        <p>
          Welcome to our premium chocolate collection featuring artisan truffles
          made with the finest cocoa beans sourced sustainably from fair-trade
          farms across the tropics.
        </p>
      </article>
    )
  },
  getOpenUIRuntimeLibraryCacheKey: (
    response: string | null | undefined,
    capsules: Array<{ capsuleName: string }> = [],
  ) =>
    `${response ?? ''}::${capsules
      .map((c) => c.capsuleName)
      .sort()
      .join(',')}`,
  loadOpenUIRuntimeLibrary: state.loadOpenUIRuntimeLibrary,
}))

// Mock convex/react: controllable useQuery for listAiCapsules.
vi.mock('convex/react', () => ({
  useQuery: state.useQuery,
}))

// Mock the generated API to avoid loading the full Convex generated bundle.
vi.mock('../../../convex/_generated/api', () => ({
  api: { sessions: { listAiCapsules: 'listAiCapsules' } },
}))

// Mock translation providers: capture locale, pass children through (avoids
// the real T component's MutationObserver / fetch side effects interfering).
vi.mock('./_providers/translation', () => ({
  I18nProvider: ({
    children,
    locale,
  }: {
    children: ReactNode
    locale?: string
  }) => {
    state.i18nLocale = locale ?? null
    return <>{children}</>
  },
  T: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

// Mock Medusa preview sync: spy on the DOM applier.
vi.mock('./medusa-preview-sync', () => ({
  applyMedusaProductsToPreviewDom: state.applyMedusaProductsToPreviewDom,
}))

// Mock generated-commerce-products: control whether products are present so
// the Medusa sync effect runs (it early-returns when products.length === 0).
vi.mock('@/features/commerce/services/generated-commerce-products', () => ({
  extractGeneratedCommerceProducts: state.extractGeneratedCommerceProducts,
}))

import OpenUIViewer from './OpenUIViewer'

// ─── Setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  // Default mocks: library resolves immediately, no capsules, no commerce
  // products, renderer renders real content.
  state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
  state.useQuery.mockReturnValue(undefined)
  state.extractGeneratedCommerceProducts.mockReturnValue([])
  state.applyMedusaProductsToPreviewDom.mockReset()
  state.rendererMode = 'content'
  state.i18nLocale = null
  state.imageContextValue = undefined

  // jsdom returns 0 for scrollHeight — the first-paint isPainted() guard
  // (`el.scrollHeight <= 40`) would always bail. Override to a realistic
  // painted height so text/img detection can succeed.
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get() {
      return 600
    },
  })

  // jsdom's innerText support is incomplete (returns '' for many layouts).
  // The first-paint isPainted() guard reads `el.innerText` for the text-length
  // threshold; alias it to textContent so rendered text is visible to the guard.
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get() {
      return this.textContent || ''
    },
  })

  // Make requestAnimationFrame synchronous so the double-rAF first-paint
  // callback and the Medusa rAF wrapper fire immediately in tests.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})

  // Polyfill ResizeObserver (not present in jsdom). MutationObserver is left
  // as jsdom's native implementation — the first-paint effect relies on a real
  // observer to detect when rendered content lands, so a no-op mock would
  // break onFirstPaint detection.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('OpenUIViewer behavioral', () => {
  // 1. Streaming state
  it('shows animated skeleton loading when source is partial/incomplete and streaming', () => {
    // Library never resolves → fallback skeleton stays visible.
    state.loadOpenUIRuntimeLibrary.mockReturnValue(new Promise(() => {}))
    state.useQuery.mockReturnValue(undefined)

    render(<OpenUIViewer response='root = Text("par' isStreaming={true} />)

    // The streaming fallback uses aria-label "Preview composing" when
    // isStreaming is true (vs "Preview loading" when idle).
    expect(
      screen.getByRole('status', { name: 'Preview composing' }),
    ).toBeTruthy()
    // The streaming dot/border overlay is rendered only when streaming AND
    // not in embed mode.
    expect(document.querySelector('.streaming-indicator')).not.toBeNull()
  })

  // 2. First paint detection (text + img)
  it('calls onFirstPaint when real content renders (text and img detection)', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)

    // --- text detection path ---
    state.rendererMode = 'content'
    const onFirstPaintText = vi.fn()
    const { unmount: unmountText } = render(
      <OpenUIViewer
        response='root = Text("Cocoa Luxe")'
        onFirstPaint={onFirstPaintText}
      />,
    )
    await waitFor(() => expect(onFirstPaintText).toHaveBeenCalledTimes(1))
    unmountText()

    // --- img detection path ---
    state.rendererMode = 'img'
    const onFirstPaintImg = vi.fn()
    render(
      <OpenUIViewer response="root = Hero()" onFirstPaint={onFirstPaintImg} />,
    )
    await waitFor(() => expect(onFirstPaintImg).toHaveBeenCalledTimes(1))
  })

  // 3. Error boundary
  it('shows fallback UI (not a crash) when the renderer throws', () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    state.rendererMode = 'throw'

    // Suppress React's expected console.error noise from the caught throw.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<OpenUIViewer response='root = Text("Store")' />)

    // The error boundary renders OpenUIRenderFallback (role=status) instead
    // of letting the error blank the page to white.
    expect(screen.getByRole('status', { name: 'Preview loading' })).toBeTruthy()

    errSpy.mockRestore()
  })

  // 4. Runtime library caching
  it('loads the library once for the same cache key (not twice on re-render)', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    // Return a stable array reference so aiCapsules useMemo is stable.
    state.useQuery.mockReturnValue([])

    const { rerender } = render(
      <OpenUIViewer response='root = Text("Cocoa")' />,
    )
    await waitFor(() =>
      expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalledTimes(1),
    )

    // Re-render with identical props — same response + same capsules → same
    // cache key → the load effect does not re-run.
    rerender(<OpenUIViewer response='root = Text("Cocoa")' />)
    expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalledTimes(1)
  })

  // 5. AI capsule injection
  it('injects AI capsules from the Convex query into the runtime loader', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    const capsuleRows = [
      {
        capsuleName: 'HeroBanner',
        parentCapsule: 'Stack',
        compiledJs: 'export default () => null',
        description: 'Hero section',
      },
    ]
    state.useQuery.mockReturnValue(capsuleRows)

    render(<OpenUIViewer response="root = HeroBanner()" sessionId="s1" />)

    await waitFor(() =>
      expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalled(),
    )

    // loadOpenUIRuntimeLibrary is called with (preparedResponse, aiCapsules).
    // The 2nd arg must contain the mapped capsule records.
    const callArgs = state.loadOpenUIRuntimeLibrary.mock.calls[0]
    expect(callArgs[1]).toEqual([
      {
        capsuleName: 'HeroBanner',
        parentCapsule: 'Stack',
        compiledJs: 'export default () => null',
        description: 'Hero section',
      },
    ])
  })

  // 6. Medusa sync
  it('syncs Medusa products after render when generated products are present', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    state.extractGeneratedCommerceProducts.mockReturnValue([
      { handle: 'truffle-box', name: 'Truffle Box', price: '$79' },
    ])
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          products: [
            {
              handle: 'ship-fast-session-truffle-box',
              sourceHandle: 'truffle-box',
              title: 'Medusa Edited Truffle Box',
              price: 89,
              currencyCode: 'eur',
            },
          ],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<OpenUIViewer response="root = StorePage()" sessionId="s1" />)

    await waitFor(() =>
      expect(state.applyMedusaProductsToPreviewDom).toHaveBeenCalled(),
    )
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/s1/medusa-products', {
      headers: { Accept: 'application/json' },
    })
  })

  it('keeps the preview usable when Medusa products returns malformed JSON', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    state.extractGeneratedCommerceProducts.mockReturnValue([
      { handle: 'truffle-box', name: 'Truffle Box', price: '$79' },
    ])
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('<!doctype html><title>Medusa unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<OpenUIViewer response="root = StorePage()" sessionId="s1" />)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(screen.getByText('root = StorePage()')).toBeTruthy()
    expect(state.applyMedusaProductsToPreviewDom).not.toHaveBeenCalled()
  })

  // 7. Medusa sync polling (fake timers)
  it('polls Medusa sync at a 5s interval', async () => {
    vi.useFakeTimers()
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    state.extractGeneratedCommerceProducts.mockReturnValue([
      { handle: 'p1', name: 'Truffle', price: '$79' },
    ])
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ products: [] }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<OpenUIViewer response="root = StorePage()" sessionId="s1" />)

    // Flush the async library load + the first immediate syncPreviewProducts.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Advance 5s → the setInterval fires a second sync.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // Advance another 5s → third sync.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  // 8. Embed mode
  it('embed mode: no rounded corners and no streaming border overlay', () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)

    const { container } = render(
      <OpenUIViewer
        response='root = Text("Store")'
        embed={true}
        isStreaming={true}
      />,
    )

    // No streaming dot/border overlay in embed mode even while streaming.
    expect(document.querySelector('.streaming-indicator')).toBeNull()

    const rootDiv = container.firstElementChild as HTMLElement
    // Embed root uses borderRadius: 0 (full-bleed iframe).
    expect(rootDiv.style.borderRadius).toBe('0px')
    // Embed root has no inset streaming box-shadow.
    expect(rootDiv.style.boxShadow).toBe('none')
  })

  // 9. Preview mode
  it('preview mode: rounded corners present', () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)

    const { container } = render(
      <OpenUIViewer response='root = Text("Store")' embed={false} />,
    )

    const rootDiv = container.firstElementChild as HTMLElement
    // Preview (non-embed) root has bottom rounded corners.
    expect(rootDiv.style.borderRadius).toMatch(/12px/)
  })

  // 10. Theme → CSS custom properties injected into the DOM
  it('injects theme colors as CSS custom properties into the DOM', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    state.rendererMode = 'content'

    const theme = {
      primary: '#22d3ee',
      accent: '#a855f7',
      background: '#0b0d14',
    }

    const { container } = render(
      <OpenUIViewer response='root = Text("Cocoa")' theme={theme} />,
    )

    await waitFor(() => expect(screen.getByText(/Cocoa/)).toBeTruthy())

    const rootDiv = container.firstElementChild as HTMLElement
    // Expected: the theme prop's colors are exposed as CSS custom properties
    // (--primary, --accent, --background) on the viewer's root element so
    // generated components can consume them. If the component silently drops
    // the theme (current bug: `theme: _theme` is unused), this fails — which
    // is the correct outcome per the assert-correct-behavior philosophy.
    expect(rootDiv.style.getPropertyValue('--primary')).toBe('#22d3ee')
    expect(rootDiv.style.getPropertyValue('--accent')).toBe('#a855f7')
    expect(rootDiv.style.getPropertyValue('--background')).toBe('#0b0d14')
  })

  // 11. Locale-driven translation
  it('passes the locale to I18nProvider', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)

    render(<OpenUIViewer response='root = Text("Store")' locale="fr" />)

    await waitFor(() => expect(state.i18nLocale).toBe('fr'))
  })

  it('defaults locale to en when none is provided', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)

    render(<OpenUIViewer response='root = Text("Store")' />)

    await waitFor(() => expect(state.i18nLocale).toBe('en'))
  })

  // 12. ImageContext
  it('passes brand imageContext to ImageContextProvider for image search bias', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue(undefined)
    const ctx = {
      section: 'hero',
      siteType: 'ecommerce' as const,
      prompt: 'artisan chocolate store',
      brandContext: 'Cocoa Luxe — fair-trade truffles',
    }

    render(<OpenUIViewer response="root = Hero()" imageContext={ctx} />)

    await waitFor(() => expect(state.imageContextValue).toEqual(ctx))
  })

  // 13. Empty source
  it('shows a skeleton/empty state for empty source while the library loads', () => {
    // Library never resolves → the loading fallback is rendered.
    state.loadOpenUIRuntimeLibrary.mockReturnValue(new Promise(() => {}))
    state.useQuery.mockReturnValue(undefined)

    render(<OpenUIViewer response="" />)

    expect(screen.getByRole('status', { name: 'Preview loading' })).toBeTruthy()
  })

  it('shows an error message fallback when the library fails to load', async () => {
    state.loadOpenUIRuntimeLibrary.mockRejectedValue(new Error('load failed'))
    state.useQuery.mockReturnValue(undefined)

    render(<OpenUIViewer response='root = Text("Store")' />)

    // The rejected load is async — wait for the error state to settle, then
    // the fallback renders the "Unable to load preview components." message
    // instead of the skeleton.
    await waitFor(() =>
      expect(
        screen.getByText('Unable to load preview components.'),
      ).toBeTruthy(),
    )
  })

  // 14. Source change
  it('reloads the library when the source changes (cache key changes)', async () => {
    state.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    state.useQuery.mockReturnValue([])

    const { rerender } = render(
      <OpenUIViewer response='root = Text("Cocoa")' />,
    )
    await waitFor(() =>
      expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalledTimes(1),
    )
    expect(state.loadOpenUIRuntimeLibrary.mock.calls[0][0]).toContain('Cocoa')

    // New source → new cache key → effect re-runs → second load.
    rerender(<OpenUIViewer response='root = Text("Vanilla")' />)
    await waitFor(() =>
      expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalledTimes(2),
    )
    expect(state.loadOpenUIRuntimeLibrary.mock.calls[1][0]).toContain('Vanilla')
  })

  // 15. Rapid source changes
  it('only renders the last source after rapid changes (stale loads cancelled)', async () => {
    // Three controllable pending promises — one per source.
    let resolveA!: (v: unknown) => void
    let resolveB!: (v: unknown) => void
    let resolveC!: (v: unknown) => void
    const pendingA = new Promise((r) => {
      resolveA = r
    })
    const pendingB = new Promise((r) => {
      resolveB = r
    })
    const pendingC = new Promise((r) => {
      resolveC = r
    })
    // Default (any unexpected 4th+ call) stays pending so it can't interfere.
    state.loadOpenUIRuntimeLibrary.mockReturnValue(new Promise(() => {}))
    state.loadOpenUIRuntimeLibrary
      .mockReturnValueOnce(pendingA)
      .mockReturnValueOnce(pendingB)
      .mockReturnValueOnce(pendingC)
    state.useQuery.mockReturnValue([])
    state.rendererMode = 'content'

    const { rerender } = render(<OpenUIViewer response='root = Text("AAA")' />)
    rerender(<OpenUIViewer response='root = Text("BBB")' />)
    rerender(<OpenUIViewer response='root = Text("CCC")' />)

    // Resolve the LAST source first → CCC content renders.
    await act(async () => {
      resolveC({})
      await Promise.resolve()
    })
    await waitFor(() => expect(screen.getByText(/CCC/)).toBeTruthy())

    // Now resolve the stale (cancelled) loads — they must NOT overwrite CCC.
    await act(async () => {
      resolveA({})
      resolveB({})
      await Promise.resolve()
    })
    expect(screen.getByText(/CCC/)).toBeTruthy()
    expect(screen.queryByText(/AAA/)).toBeNull()
    expect(screen.queryByText(/BBB/)).toBeNull()

    // Exactly 3 loads (one per source change).
    expect(state.loadOpenUIRuntimeLibrary).toHaveBeenCalledTimes(3)
  })
})
