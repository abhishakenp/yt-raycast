// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrandMediaPanel } from './BrandMediaPanel'

/**
 * Controllable brand-profile + Pexels fetch state.
 * Tests mutate these before driving the UI so the real BrandMediaPanel
 * observes realistic `/api/brand-profile` and `/api/pexels` responses.
 */
const fetchState = vi.hoisted(() => ({
  brandProfile: {
    ok: true,
    query: 'linear.app',
    match: { name: 'Linear', domain: 'linear.app', brandId: 'iduDa181eM' },
    logo: { src: 'https://cdn.brandfetch.io/linear/logo.svg' },
    palette: {
      colors: ['#5e6ad2', '#171717', '#ffffff', '#262626'],
      dominant: '#5e6ad2',
    },
    confidence: 0.95,
  } as Record<string, unknown>,
  brandStatus: 200,
  brandError: 'Brand lookup failed',
  pexelsImages: [
    { id: 'p1', src: 'https://images.pexels.com/p1.jpg' },
    { id: 'p2', src: 'https://images.pexels.com/p2.jpg' },
  ],
  /** When true, the next brand-profile fetch rejects (network failure). */
  brandFetchThrows: false,
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(async () => null),
  useQuery: () => null,
}))

const fetchMock = vi.fn(async (url: string | URL, _init?: RequestInit) => {
  const path = String(url)

  if (path.startsWith('/api/brand-profile')) {
    if (fetchState.brandFetchThrows) {
      throw new Error(fetchState.brandError)
    }
    const status = fetchState.brandStatus
    const body =
      status >= 400
        ? { ok: false, error: fetchState.brandError }
        : fetchState.brandProfile
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (path.startsWith('/api/pexels')) {
    return new Response(JSON.stringify({ images: fetchState.pexelsImages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: `Unexpected ${path}` }), {
    status: 500,
  })
})

const setBrandProfile = (profile: Record<string, unknown>, status = 200) => {
  fetchState.brandProfile = profile
  fetchState.brandStatus = status
  fetchState.brandFetchThrows = false
}

const setBrandError = (error: string, status = 404) => {
  fetchState.brandError = error
  fetchState.brandStatus = status
  fetchState.brandFetchThrows = false
}

const lookupBrand = (view: ReturnType<typeof render>) => {
  const button = view.getByRole('button', { name: /lookup brand/i })
  fireEvent.click(button)
}

describe('BrandMediaPanel', () => {
  beforeEach(() => {
    fetchMock.mockClear()
    setBrandProfile({
      ok: true,
      query: 'linear.app',
      match: { name: 'Linear', domain: 'linear.app', brandId: 'iduDa181eM' },
      logo: { src: 'https://cdn.brandfetch.io/linear/logo.svg' },
      palette: {
        colors: ['#5e6ad2', '#171717', '#ffffff', '#262626'],
        dominant: '#5e6ad2',
      },
      confidence: 0.95,
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('1. renders a brand/domain lookup input and triggers a brand fetch on lookup', async () => {
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<BrandMediaPanel />)

    const input = view.getByLabelText(/brand or domain/i) as HTMLInputElement
    expect(input).toBeTruthy()

    fireEvent.change(input, { target: { value: 'stripe.com' } })
    expect(input.value).toBe('stripe.com')

    lookupBrand(view)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/brand-profile?query=stripe.com'),
        undefined,
      ),
    )
  })

  it('2. shows the brand profile (logo, name, domain) after a brand fetch', async () => {
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<BrandMediaPanel />)

    lookupBrand(view)

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())

    const logo = view.container.querySelector(
      'img[src="https://cdn.brandfetch.io/linear/logo.svg"]',
    )
    expect(logo).toBeTruthy()

    expect(view.getByText('linear.app')).toBeTruthy()
  })

  it('3. displays up to 8 palette colors as swatches', async () => {
    const eightColors = [
      '#5e6ad2',
      '#171717',
      '#ffffff',
      '#262626',
      '#0a0a0a',
      '#333333',
      '#cccccc',
      '#999999',
    ]
    setBrandProfile({
      ok: true,
      query: 'linear.app',
      match: { name: 'Linear', domain: 'linear.app' },
      logo: { src: 'https://cdn.brandfetch.io/linear/logo.svg' },
      palette: { colors: eightColors, dominant: eightColors[0] },
      confidence: 0.95,
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<BrandMediaPanel />)
    lookupBrand(view)

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())

    const swatches = view.container.querySelectorAll(
      '.flex.flex-wrap.gap-1\\.5 > span',
    )
    expect(swatches).toHaveLength(8)
  })

  it('4. stock image search renders a preview image result', async () => {
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<BrandMediaPanel prompt="modern dashboard" />)

    const imageInput = view.getByLabelText(/image search/i) as HTMLInputElement
    fireEvent.change(imageInput, { target: { value: 'mountain landscape' } })

    const previewButton = view.getByRole('button', { name: /preview image/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      const preview = view.container.querySelector(
        'img.aspect-video',
      ) as HTMLImageElement | null
      expect(preview).toBeTruthy()
      expect(preview?.src).toContain('/api/pexels')
      expect(preview?.src).toContain('query=mountain%20landscape')
    })
  })

  it('5. design reference display shows clone URL, reference URLs, and notes', () => {
    vi.stubGlobal('fetch', fetchMock)
    const view = render(
      <BrandMediaPanel
        cloneUrl="https://stripe.com"
        designReferenceUrls={[
          'https://linear.app/customers',
          'https://vercel.com/pricing',
        ]}
        designReferenceNotes="Match the bold gradient hero and pricing table density."
      />,
    )

    expect(view.getByText('Design references')).toBeTruthy()
    expect(view.getByText(/Clone: https:\/\/stripe\.com/)).toBeTruthy()
    expect(
      view.getByText(/Reference: https:\/\/linear\.app\/customers/),
    ).toBeTruthy()
    expect(
      view.getByText(/Reference: https:\/\/vercel\.com\/pricing/),
    ).toBeTruthy()
    expect(
      view.getByText('Match the bold gradient hero and pricing table density.'),
    ).toBeTruthy()
  })

  it('6. shows a loading state during brand fetch', async () => {
    let resolveBrand: ((value: Response) => void) | undefined
    const slowFetch = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const path = String(url)
      if (path.startsWith('/api/brand-profile')) {
        return new Promise<Response>((resolve) => {
          resolveBrand = (value: Response) => resolve(value)
        })
      }
      return fetchMock(path, init)
    })
    vi.stubGlobal('fetch', slowFetch)

    const view = render(<BrandMediaPanel />)
    const input = view.getByLabelText(/brand or domain/i) as HTMLInputElement
    expect(input.disabled).toBe(false)

    lookupBrand(view)

    await waitFor(() =>
      expect(view.getByRole('button', { name: /looking up/i })).toBeTruthy(),
    )
    expect(input.disabled).toBe(true)

    if (resolveBrand) {
      resolveBrand(
        new Response(JSON.stringify(fetchState.brandProfile), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
    await waitFor(() =>
      expect(view.getByRole('button', { name: /lookup brand/i })).toBeTruthy(),
    )
  })

  it('7. shows an error state when the brand is not found', async () => {
    setBrandError('No Brandfetch match found', 404)
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<BrandMediaPanel />)
    lookupBrand(view)

    await waitFor(() =>
      expect(view.getByText('No Brandfetch match found')).toBeTruthy(),
    )
    expect(view.container.querySelector('img[src*="brandfetch.io"]')).toBeNull()
  })

  it('8. shows an empty state when no brand has been searched yet', () => {
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<BrandMediaPanel />)

    expect(view.getByLabelText(/brand or domain/i)).toBeTruthy()
    expect(view.getByRole('button', { name: /lookup brand/i })).toBeTruthy()
    // No profile rendered, no error rendered, no design references section.
    expect(view.container.querySelector('img[src*="brandfetch.io"]')).toBeNull()
    expect(view.queryByText(/Design references/)).toBeNull()
    expect(view.container.querySelector('.text-rose-200')).toBeNull()
  })

  it('9. color swatches expose their hex values via the title attribute', async () => {
    setBrandProfile({
      ok: true,
      query: 'linear.app',
      match: { name: 'Linear', domain: 'linear.app' },
      logo: { src: 'https://cdn.brandfetch.io/linear/logo.svg' },
      palette: {
        colors: ['#5e6ad2', '#171717', '#ffffff'],
        dominant: '#5e6ad2',
      },
      confidence: 0.95,
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<BrandMediaPanel />)
    lookupBrand(view)

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())

    const swatches = Array.from(
      view.container.querySelectorAll('.flex.flex-wrap.gap-1\\.5 > span'),
    ) as HTMLElement[]
    expect(swatches.length).toBeGreaterThan(0)
    const titles = swatches.map((swatch) => swatch.getAttribute('title'))
    expect(titles).toContain('#5e6ad2')
    expect(titles).toContain('#171717')
    expect(titles).toContain('#ffffff')
    // The swatch background style should match its hex value.
    expect(swatches[0].style.background).toBe('#5e6ad2')
  })

  it('10. brand profile cache: a second lookup of the same domain reuses cached data without refetching', async () => {
    vi.stubGlobal('fetch', fetchMock)

    const view = render(<BrandMediaPanel />)
    const input = view.getByLabelText(/brand or domain/i) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'linear.app' } })
    lookupBrand(view)

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())
    const firstCallCount = fetchMock.mock.calls.filter(([url]) =>
      String(url).startsWith('/api/brand-profile'),
    ).length
    expect(firstCallCount).toBe(1)

    // Second lookup of the same domain should be served from cache.
    lookupBrand(view)

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())
    const secondCallCount = fetchMock.mock.calls.filter(([url]) =>
      String(url).startsWith('/api/brand-profile'),
    ).length
    expect(secondCallCount).toBe(firstCallCount)
  })
})
