// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PropertyListingLakebed } from './property-listing-interactions.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'

type PropertyListingState = ReturnType<
  typeof propertyListingLakebed.queries.propertyListingState
>
type PropertyInquiry = PropertyListingState['inquiries'][number]
type PropertyListingCatalogItem = ReturnType<
  typeof propertyListingLakebed.queries.propertyCatalog
>[number]
type PropertySearch = PropertyListingState['searches'][number]
type PropertySaved = PropertyListingState['saved'][number]
type PropertyStateRow = {
  createdAt: string
  filter: string
  id: string
  location: string
  query: string
  selectedAddress: string
  updatedAt: string
}
type PropertyMutationDelayName = 'selectListing' | 'setPropertySearch'
type PropertyMutationInput =
  | Parameters<typeof propertyListingLakebed.mutations.recordPropertyInquiry>[1]
  | Parameters<typeof propertyListingLakebed.mutations.saveListing>[1]
  | Parameters<typeof propertyListingLakebed.mutations.selectListing>[1]
  | Parameters<typeof propertyListingLakebed.mutations.setPropertySearch>[1]
  | Parameters<typeof propertyListingLakebed.mutations.syncPropertyListings>[1]

const navigate = vi.fn()
const lakebedRef: { current: PropertyListingLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('#/lib/img.tsx', () => ({
  Image: ({ alt, className }: { alt: string; className?: string }) => (
    <img alt={alt} className={className} />
  ),
}))

type TestMutation = ((input?: PropertyMutationInput) => Promise<unknown>) & {
  lastError: unknown | null
  reset: () => void
}

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => {
    if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
    return lakebedRef.current
  }),
  useKeyedLakebedMutation: (
    lakebed: { useMutation: (name: string) => TestMutation },
    name: string,
  ) => {
    const mutation = lakebed.useMutation(name)
    const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
    const run = useCallback(
      async (key: string, input: PropertyMutationInput) => {
        if (pendingKeys.includes(key)) return undefined

        setPendingKeys((current) =>
          current.includes(key) ? current : [...current, key],
        )
        try {
          return await mutation(input)
        } finally {
          setPendingKeys((current) => current.filter((item) => item !== key))
        }
      },
      [mutation, pendingKeys],
    )
    const isPending = useCallback(
      (key: string) => pendingKeys.includes(key),
      [pendingKeys],
    )
    const reset = useCallback(() => {
      setPendingKeys([])
      mutation.reset()
    }, [mutation])

    return {
      hasPending: pendingKeys.length > 0,
      isPending,
      lastError: mutation.lastError,
      pendingKey: pendingKeys[0] ?? null,
      pendingKeys,
      reset,
      run,
    }
  },
}))

if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })
  const defineGlobal = (name: string, value: unknown) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }
  const requestAnimationFrame = (callback: FrameRequestCallback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: number) => clearTimeout(id)
  class TestResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('FormData', dom.window.FormData)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
  defineGlobal('NodeFilter', dom.window.NodeFilter)
  defineGlobal('PointerEvent', dom.window.PointerEvent ?? dom.window.MouseEvent)
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('ResizeObserver', TestResizeObserver)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
  dom.window.ResizeObserver = TestResizeObserver
  dom.window.HTMLElement.prototype.scrollIntoView = () => {}
}

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

if (typeof ResizeObserver === 'undefined') {
  class TestResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: TestResizeObserver,
    writable: true,
  })

  if (typeof window !== 'undefined') {
    window.ResizeObserver = TestResizeObserver
  }
}

if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.scrollIntoView !== 'function'
) {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { PropertyListingHero } = await import('./PropertyListingHero.tsx')
const { PropertyListingGallery } = await import('./PropertyListingGallery.tsx')
const { PropertyListingNavbar } = await import('./PropertyListingNavbar.tsx')
const { PropertyListingCta } = await import('./PropertyListingCta.tsx')
const { PropertyListingOverview } =
  await import('./PropertyListingOverview.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createPropertyListingLakebedStub(
  mutationDelays: Partial<Record<PropertyMutationDelayName, number>> = {},
) {
  let version = 0
  let inquiries: PropertyInquiry[] = []
  let listings: PropertyListingCatalogItem[] = []
  let saved: PropertySaved[] = []
  let searches: PropertySearch[] = []
  let state: PropertyStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const mutationDelayFor = (name: string) => {
    if (name === 'selectListing') return mutationDelays.selectListing ?? 0
    if (name === 'setPropertySearch') {
      return mutationDelays.setPropertySearch ?? 0
    }
    return 0
  }
  const waitForMutation = (name: string) => {
    const delayMs = mutationDelayFor(name)
    if (delayMs <= 0) return Promise.resolve()

    return new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs)
    })
  }
  const row = <TRow extends Record<string, unknown>>(
    prefix: string,
    value: TRow,
    index: number,
  ) => ({
    ...value,
    createdAt: now,
    id: `${prefix}-${index}`,
    updatedAt: now,
  })
  const summary = () => ({
    filter: state?.filter ?? '',
    inquiries,
    inquiryCount: inquiries.length,
    location: state?.location ?? '',
    query: state?.query ?? '',
    saved,
    savedAddresses: saved.map((item) => item.address),
    savedCount: saved.length,
    searches,
    selectedAddress: state?.selectedAddress ?? '',
  })

  const lakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      user: { displayName: 'Guest', email: '', isGuest: true },
    }),
    useData: () => ({
      inquiries,
      listings,
      saved,
      searches,
      state: state ? [state] : [],
    }),
    useQuery: (name: string) => {
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener)
          return () => {
            listeners.delete(listener)
          }
        },
        () => version,
        () => version,
      )

      if (name === 'propertyCatalog') return listings
      if (name === 'propertyListingState') return summary()
      return null
    },
    useMutation: (name: string) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: PropertyMutationInput = {}) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            await waitForMutation(name)

            if (name === 'setPropertySearch') {
              if (!('filter' in input)) return []
              state = row(
                'state',
                {
                  filter: input.filter?.trim() ?? '',
                  location: input.location?.trim() ?? '',
                  query: input.query?.trim() ?? '',
                  selectedAddress: '',
                },
                1,
              )
              searches = [
                row(
                  'search',
                  {
                    filter: state.filter,
                    location: state.location,
                    query: state.query,
                  },
                  searches.length + 1,
                ),
                ...searches,
              ]
            }

            if (name === 'saveListing') {
              if (!('address' in input)) return []
              const address = input.address?.trim() ?? ''
              const existing = saved.find((item) => item.address === address)
              saved = existing
                ? saved.filter((item) => item.address !== address)
                : [
                    row(
                      'saved',
                      {
                        address,
                        price: input.price?.trim() ?? '',
                      },
                      saved.length + 1,
                    ),
                    ...saved,
                  ]
            }

            if (name === 'selectListing') {
              if (!('address' in input)) return []
              const selectedAddress = input.address?.trim() ?? ''
              state = row(
                'state',
                {
                  filter: state?.filter ?? '',
                  location: state?.location ?? '',
                  query: state?.query ?? '',
                  selectedAddress,
                },
                1,
              )
            }

            if (name === 'recordPropertyInquiry') {
              if (!('intent' in input)) return []
              const intent = input.intent.trim()
              if (intent) {
                inquiries = [
                  row(
                    'inquiry',
                    {
                      address: input.address?.trim() ?? '',
                      intent,
                      source: input.source?.trim() ?? '',
                    },
                    inquiries.length + 1,
                  ),
                  ...inquiries,
                ]
              }
            }

            if (name === 'syncPropertyListings') {
              if (!('listings' in input)) return []
              const existingByAddress = new Map(
                listings.map((listing) => [
                  listing.address.toLowerCase(),
                  listing,
                ]),
              )
              listings = input.listings
                .filter((listing) => listing.address.trim())
                .map((listing, index) => {
                  const address = listing.address.trim()
                  const existing = existingByAddress.get(address.toLowerCase())

                  return row(
                    'listing',
                    {
                      address,
                      baths: listing.baths.trim(),
                      beds: listing.beds.trim(),
                      price: listing.price.trim(),
                      sqft: listing.sqft.trim(),
                      tag: listing.tag?.trim() ?? '',
                    },
                    existing
                      ? Number(existing.id.split('-').at(-1))
                      : index + 1,
                  )
                })
            }

            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name],
      )
      const mutation = useMemo(() => {
        const callable = Object.assign(
          (input?: PropertyMutationInput) => runMutation(input),
          {
            isPending: false,
            lastError: null,
            pendingCount: 0,
            reset,
          },
        )
        return callable
      }, [reset, runMutation])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return {
    catalog: () => listings,
    inquiries: () => inquiries,
    lakebed,
    saved: () => saved,
    searches: () => searches,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
})

describe('property listing fullstack search', () => {
  it('lets hero search filter the listing gallery and record listing actions', async () => {
    const { inquiries, lakebed, saved, searches, state } =
      createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Hero = PropertyListingHero.client.component
    const Gallery = PropertyListingGallery.client.component

    render(
      <>
        <Hero props={{}} statementId="property_listing_hero" />
        <Gallery props={{}} statementId="property_listing_gallery" />
      </>,
    )

    expect(screen.getByText('210 Birch St #5, Midtown')).toBeTruthy()
    expect(screen.getByText('1207 Cedar Hollow, Lakeview')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Search by city, area, or ZIP'), {
      target: { value: 'Lakeview' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'For Sale',
        location: 'Lakeview',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(screen.getByText('1207 Cedar Hollow, Lakeview')).toBeTruthy()
    expect(screen.queryByText('210 Birch St #5, Midtown')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: 'Save 1207 Cedar Hollow, Lakeview' }),
    )
    await waitFor(() => expect(saved()).toHaveLength(1))
    expect(saved()[0]).toMatchObject({
      address: '1207 Cedar Hollow, Lakeview',
      price: '$945,000',
    })

    fireEvent.click(screen.getByRole('button', { name: /\$945,000/i }))
    await waitFor(() =>
      expect(state()).toMatchObject({
        selectedAddress: '1207 Cedar Hollow, Lakeview',
      }),
    )

    navigate.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Contact agent' }))
    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(inquiries()[0]).toMatchObject({
      address: '1207 Cedar Hollow, Lakeview',
      intent: 'Contact agent',
      source: 'listing-card',
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('lets gallery filters and hero popular chips share the same result state', async () => {
    const { lakebed, state } = createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Hero = PropertyListingHero.client.component
    const Gallery = PropertyListingGallery.client.component

    render(
      <>
        <Hero props={{}} statementId="property_listing_hero" />
        <Gallery props={{}} statementId="property_listing_gallery" />
      </>,
    )

    const [rentFilter] = screen.getAllByRole('button', { name: 'For Rent' })
    if (!rentFilter) throw new Error('Expected For Rent filter')
    fireEvent.click(rentFilter)

    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'For Rent',
      }),
    )
    expect(screen.getByText('210 Birch St #5, Midtown')).toBeTruthy()
    expect(screen.queryByText('88 Aspen Way, Northgate')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Houses' }))
    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'For Sale',
        query: 'Houses',
      }),
    )
    expect(
      screen.getByText('No listings match the current search.'),
    ).toBeTruthy()
  })

  it('lets navbar command search drive shared listing results without navigation fallback', async () => {
    const { catalog, lakebed, state } = createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = PropertyListingNavbar.client.component
    const Gallery = PropertyListingGallery.client.component

    render(
      <>
        <Navbar props={{}} statementId="property_listing_navbar" />
        <Gallery props={{}} statementId="property_listing_gallery" />
      </>,
    )

    await waitFor(() => expect(catalog()).not.toHaveLength(0))

    fireEvent.click(screen.getByRole('button', { name: 'Search listings' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Search listings',
    })
    fireEvent.click(within(dialog).getByText('88 Aspen Way, Northgate'))

    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'For Sale',
        location: '',
        query: '88 Aspen Way, Northgate',
        selectedAddress: '88 Aspen Way, Northgate',
      }),
    )
    expect(screen.getByText('88 Aspen Way, Northgate')).toBeTruthy()
    expect(screen.queryByText('210 Birch St #5, Midtown')).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('keeps command-selected listing after slower search state resolves', async () => {
    const { catalog, lakebed, state } = createPropertyListingLakebedStub({
      setPropertySearch: 20,
    })
    lakebedRef.current = lakebed
    const Navbar = PropertyListingNavbar.client.component
    const Gallery = PropertyListingGallery.client.component

    render(
      <>
        <Navbar props={{}} statementId="property_listing_navbar" />
        <Gallery props={{}} statementId="property_listing_gallery" />
      </>,
    )

    await waitFor(() => expect(catalog()).not.toHaveLength(0))

    fireEvent.click(screen.getByRole('button', { name: 'Search listings' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Search listings',
    })
    fireEvent.click(within(dialog).getByText('88 Aspen Way, Northgate'))

    await waitFor(() =>
      expect(state()).toMatchObject({
        filter: 'For Sale',
        query: '88 Aspen Way, Northgate',
        selectedAddress: '88 Aspen Way, Northgate',
      }),
    )
    expect(navigate).not.toHaveBeenCalled()
  })

  it('records navbar and CTA inquiries while preserving page navigation for nav links', async () => {
    const { inquiries, lakebed } = createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = PropertyListingNavbar.client.component
    const Cta = PropertyListingCta.client.component

    render(
      <>
        <Navbar props={{ cta: 'Post Listing' }} statementId="navbar" />
        <Cta props={{}} statementId="cta" />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'For Sale' }))
    expect(navigate).toHaveBeenCalledWith('For Sale')
    navigate.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Post Listing' }))
    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(inquiries()[0]).toMatchObject({
      intent: 'Post',
      source: 'navbar',
    })
    expect(navigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Post a Listing' }))
    await waitFor(() => expect(inquiries()).toHaveLength(2))
    expect(inquiries()[0]).toMatchObject({
      intent: 'Post',
      source: 'cta',
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('records overview CTA inquiries without routing action labels', async () => {
    const { inquiries, lakebed } = createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Overview = PropertyListingOverview.client.component

    render(
      <Overview
        props={{
          primaryCta: 'Schedule a tour',
          secondaryCta: 'Request valuation',
        }}
        statementId="overview"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Schedule a tour' }))
    await waitFor(() => expect(inquiries()).toHaveLength(1))
    expect(inquiries()[0]).toMatchObject({
      intent: 'Schedule a tour',
      source: 'overview:primary',
    })
    expect(navigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Request valuation' }))
    await waitFor(() => expect(inquiries()).toHaveLength(2))
    expect(inquiries()[0]).toMatchObject({
      intent: 'Request valuation',
      source: 'overview:secondary',
    })
    expect(inquiries()[1]).toMatchObject({
      intent: 'Schedule a tour',
      source: 'overview:primary',
    })
    expect(navigate).not.toHaveBeenCalled()
  })

  it('exposes Shoo account dropdown and Sheet mobile navigation', async () => {
    const { lakebed } = createPropertyListingLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = PropertyListingNavbar.client.component

    render(<Navbar props={{}} statementId="property_listing_navbar" />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(lakebed.signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Nestable',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Agents' }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('Agents'))
  })
})
