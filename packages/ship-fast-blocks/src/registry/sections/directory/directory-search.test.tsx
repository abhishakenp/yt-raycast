// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import type { DirectoryLakebed } from './directory-interactions.tsx'
import {
  directoryLakebed,
  type DirectoryLeadInput,
  type DirectoryListingInput,
  type DirectorySearchInput,
  type DirectorySelectInput,
} from './directory-lakebed.ts'

type DirectoryState = ReturnType<typeof directoryLakebed.queries.directoryState>
type DirectoryCatalogItem = ReturnType<
  typeof directoryLakebed.queries.directoryCatalog
>[number]
type DirectoryLead = DirectoryState['leads'][number]
type DirectorySearch = DirectoryState['searches'][number]
type DirectorySelection = DirectoryState['selections'][number]
type DirectoryStateRow = {
  category: string
  createdAt: string
  id: string
  query: string
  selectedName: string
  updatedAt: string
}

const navigate = vi.fn()
const lakebedRef: { current: DirectoryLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('#/lib/img.tsx', () => ({
  Image: ({ alt, className }: { alt: string; className?: string }) => (
    <img alt={alt} className={className} />
  ),
}))

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
      return lakebedRef.current
    }),
  }
})

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
  defineGlobal('PointerEvent', dom.window.PointerEvent ?? dom.window.MouseEvent)
  defineGlobal(
    'ResizeObserver',
    dom.window.ResizeObserver ??
      class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
  )
  defineGlobal('SVGElement', dom.window.SVGElement)
  defineGlobal('getComputedStyle', dom.window.getComputedStyle)
  defineGlobal('navigator', dom.window.navigator)
  defineGlobal('requestAnimationFrame', requestAnimationFrame)
  defineGlobal('cancelAnimationFrame', cancelAnimationFrame)
  defineGlobal('window', dom.window)
  dom.window.requestAnimationFrame = requestAnimationFrame
  dom.window.cancelAnimationFrame = cancelAnimationFrame
  Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

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

if (
  typeof Element !== 'undefined' &&
  typeof Element.prototype.scrollIntoView !== 'function'
) {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

if (typeof window !== 'undefined' && 'FormData' in window) {
  Object.defineProperty(globalThis, 'FormData', {
    configurable: true,
    value: window.FormData,
    writable: true,
  })
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { DirectoryHero } = await import('./DirectoryHero.tsx')
const { DirectoryCategories } = await import('./DirectoryCategories.tsx')
const { DirectoryFeatured } = await import('./DirectoryFeatured.tsx')
const { DirectoryNavbar } = await import('./DirectoryNavbar.tsx')
const { DirectoryCta } = await import('./DirectoryCta.tsx')
const { DirectoryPricing } = await import('./DirectoryPricing.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createDirectoryLakebedStub() {
  let version = 0
  let items: DirectoryCatalogItem[] = []
  let leads: DirectoryLead[] = []
  let searches: DirectorySearch[] = []
  let selections: DirectorySelection[] = []
  let state: DirectoryStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const summary = () => ({
    category: state?.category ?? '',
    leadCount: leads.length,
    leads,
    query: state?.query ?? '',
    searches,
    selectedName: state?.selectedName ?? '',
    selections,
    selectionCount: selections.length,
  })
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

  const useQuery = createLakebedQueryStub<typeof directoryLakebed>({
    directoryCatalog: () => {
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
      return items
    },
    directoryState: () => {
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
      return summary()
    },
  })

  const useMutation = createLakebedMutationStub<typeof directoryLakebed>({
    requestListing: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: DirectoryLeadInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          leads = [
            row(
              'lead',
              {
                action: input.action.trim(),
                source: input.source?.trim() ?? '',
              },
              leads.length + 1,
            ),
            ...leads,
          ]
          notify()
          return leads
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: DirectoryLeadInput) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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
    selectListing: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: DirectorySelectInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          const nameValue = input.name.trim()
          state = row(
            'state',
            {
              category: state?.category ?? '',
              query: state?.query ?? '',
              selectedName: nameValue,
            },
            1,
          )
          selections = [
            row(
              'selection',
              {
                category: input.category?.trim() ?? '',
                name: nameValue,
              },
              selections.length + 1,
            ),
            ...selections,
          ]
          notify()
          return selections
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: DirectorySelectInput) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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
    setDirectorySearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: DirectorySearchInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          state = row(
            'state',
            {
              category: input.category?.trim() ?? '',
              query: input.query?.trim() ?? '',
              selectedName: '',
            },
            1,
          )
          searches = [
            row(
              'search',
              { category: state.category, query: state.query },
              searches.length + 1,
            ),
            ...searches,
          ]
          notify()
          return state ? [state] : []
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: DirectorySearchInput) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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
    syncListings: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: { items: DirectoryListingInput[] }) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const existingByName = new Map(
              items.map((item) => [item.name.toLowerCase(), item]),
            )

            for (const item of input.items) {
              const nameValue = item.name.trim()
              if (!nameValue) continue

              const current = existingByName.get(nameValue.toLowerCase())
              const next = {
                address: item.address?.trim() ?? '',
                category: item.category?.trim() ?? '',
                hours: item.hours?.trim() ?? '',
                imageAlt: item.imageAlt?.trim() ?? '',
                name: nameValue,
                rating: item.rating?.trim() ?? '',
                reviews: item.reviews?.trim() ?? '',
              }

              if (current) {
                items = items.map((candidate) =>
                  candidate.id === current.id
                    ? { ...current, ...next, updatedAt: now }
                    : candidate,
                )
              } else {
                items = [...items, row('item', next, items.length + 1)]
              }
            }
            notify()
            return items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: { items: DirectoryListingInput[] }) => runMutation(input),
          {
            isPending: false,
            lastError: initialLastError,
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
  })

  const lakebed: DirectoryLakebed = {
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      provider: 'guest',
      userId: 'guest:local',
      displayName: 'Guest',
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
    }),
    useData: () => ({
      items,
      leads,
      searches,
      selections,
      state: state ? [state] : [],
    }),
    useQuery,
    useMutation,
  }

  return {
    catalog: () => items,
    lakebed,
    leads: () => leads,
    searches: () => searches,
    selections: () => selections,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  lakebedRef.current = null
  navigate.mockReset()
})

describe('directory fullstack search', () => {
  it('lets hero search filter featured listings and record selections', async () => {
    const { lakebed, searches, selections, state } =
      createDirectoryLakebedStub()
    lakebedRef.current = lakebed
    const Hero = DirectoryHero.client.component
    const Featured = DirectoryFeatured.client.component

    render(
      <>
        <Hero props={{}} statementId="directory_hero" />
        <Featured props={{}} statementId="directory_featured" />
      </>,
    )

    expect(screen.getByText('Brew & Bloom Café')).toBeTruthy()
    expect(screen.getByText('Shear Perfection Studio')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Search businesses'), {
      target: { value: 'plumbing' },
    })
    const searchForm = screen
      .getByRole('button', { name: 'Search' })
      .closest('form')
    if (!searchForm) throw new Error('Expected directory search form')
    fireEvent.submit(searchForm)

    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'plumbing',
        selectedName: '',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(screen.getByText('Rapid Flow Plumbing')).toBeTruthy()
    expect(screen.queryByText('Brew & Bloom Café')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: /Rapid Flow Plumbing/i }),
    )
    await waitFor(() => expect(selections()).toHaveLength(1))
    expect(state()?.selectedName).toBe('Rapid Flow Plumbing')
    expect(selections()[0]).toMatchObject({
      category: 'Plumbing',
      name: 'Rapid Flow Plumbing',
    })
  })

  it('lets category tiles drive the same featured-listing filter', async () => {
    const { lakebed, state } = createDirectoryLakebedStub()
    lakebedRef.current = lakebed
    const Categories = DirectoryCategories.client.component
    const Featured = DirectoryFeatured.client.component

    render(
      <>
        <Categories
          props={{ items: [{ title: 'Coffee Shop', count: '12 listings' }] }}
          statementId="directory_categories"
        />
        <Featured props={{}} statementId="directory_featured" />
      </>,
    )

    const [categoryButton] = screen.getAllByRole('button', {
      name: /Coffee Shop/i,
    })
    if (!categoryButton) throw new Error('Expected Coffee Shop category tile')
    fireEvent.click(categoryButton)
    await waitFor(() =>
      expect(state()).toMatchObject({
        category: 'Coffee Shop',
      }),
    )
    expect(screen.getByText('Brew & Bloom Café')).toBeTruthy()
    expect(screen.queryByText('Shear Perfection Studio')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: /View All 24 Categories/i }),
    )
    await waitFor(() =>
      expect(state()).toMatchObject({
        category: '',
        query: '',
      }),
    )
    expect(screen.getByText('Shear Perfection Studio')).toBeTruthy()
  })

  it('lets navbar command search drive shared directory results', async () => {
    const { catalog, lakebed, state } = createDirectoryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = DirectoryNavbar.client.component
    const Featured = DirectoryFeatured.client.component

    render(
      <>
        <Navbar props={{}} statementId="directory_navbar" />
        <Featured props={{}} statementId="directory_featured" />
      </>,
    )

    await waitFor(() => expect(catalog()).not.toHaveLength(0))

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Search directory',
    })
    fireEvent.click(within(dialog).getByText('Rapid Flow Plumbing'))

    await waitFor(() =>
      expect(state()).toMatchObject({
        category: 'Plumbing',
        query: 'Rapid Flow Plumbing',
      }),
    )
    expect(screen.getByText('Rapid Flow Plumbing')).toBeTruthy()
    expect(screen.queryByText('Brew & Bloom Café')).toBeNull()
  })

  it('records listing CTA leads without using navigation state', async () => {
    const { lakebed, leads } = createDirectoryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = DirectoryNavbar.client.component
    const Cta = DirectoryCta.client.component

    render(
      <>
        <Navbar props={{ listCta: 'List Your Business' }} statementId="nav" />
        <Cta
          props={{ primaryCta: 'List Your Business Free' }}
          statementId="cta"
        />
      </>,
    )

    const [navbarCta] = screen.getAllByRole('button', {
      name: 'List Your Business',
    })
    if (!navbarCta) throw new Error('Expected directory navbar CTA')
    fireEvent.click(navbarCta)

    await waitFor(() => expect(leads()).toHaveLength(1))
    expect(leads()[0]).toMatchObject({
      action: 'List Your Business',
      source: 'navbar',
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'List Your Business Free' }),
    )
    await waitFor(() => expect(leads()).toHaveLength(2))
    expect(leads()[0]).toMatchObject({
      action: 'List Your Business Free',
      source: 'cta',
    })
  })

  it('records pricing plan CTAs as listing leads instead of page navigation', async () => {
    const { lakebed, leads } = createDirectoryLakebedStub()
    lakebedRef.current = lakebed
    const Pricing = DirectoryPricing.client.component

    render(
      <Pricing
        props={{
          plans: [
            {
              badge: '',
              cta: 'Start Trial',
              excluded: [],
              featured: true,
              features: ['Priority placement'],
              name: 'Premium',
              period: '/month',
              price: '$29',
              tagline: 'Best for growing businesses',
            },
          ],
        }}
        statementId="directory_pricing"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Start Trial' }))

    await waitFor(() => expect(leads()).toHaveLength(1))
    expect(leads()[0]).toMatchObject({
      action: 'Start Trial',
      source: 'pricing:Premium',
    })
    expect(navigate).not.toHaveBeenCalledWith('Start Trial')
  })
})
