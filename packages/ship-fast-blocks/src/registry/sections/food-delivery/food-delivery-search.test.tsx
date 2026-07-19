// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import type { FoodDeliveryLakebed } from './food-delivery-interactions.tsx'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'

type FoodDeliveryState = ReturnType<
  typeof foodDeliveryLakebed.queries.foodDeliveryState
>
type FoodAction = FoodDeliveryState['actions'][number]
type FoodCatalogItem = ReturnType<
  typeof foodDeliveryLakebed.queries.restaurantCatalog
>[number]
type FoodSearch = FoodDeliveryState['searches'][number]
type FoodSelection = FoodDeliveryState['selections'][number]
type FoodStateRow = {
  address: string
  createdAt: string
  id: string
  query: string
  selectedCuisine: string
  selectedRestaurant: string
  updatedAt: string
}

const navigate = vi.fn()
const lakebedRef: { current: FoodDeliveryLakebed | null } = { current: null }

vi.mock('#/lib/img.tsx', () => ({
  Image: ({ alt, className }: { alt?: string; className?: string }) => (
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
  const requestAnimationFrame = (callback: (time: number) => void) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id: ReturnType<typeof setTimeout>) =>
    clearTimeout(id)

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
const { FoodDeliverySearchButton } =
  await import('./food-delivery-interactions.tsx')
const { FoodDeliveryHero } = await import('./FoodDeliveryHero.tsx')
const { FoodDeliveryNavbar } = await import('./FoodDeliveryNavbar.tsx')
const { FoodDeliveryRestaurants } =
  await import('./FoodDeliveryRestaurants.tsx')
const { FoodDeliveryCta } = await import('./FoodDeliveryCta.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createFoodDeliveryLakebedStub() {
  let version = 0
  let actions: FoodAction[] = []
  let items: FoodCatalogItem[] = []
  let searches: FoodSearch[] = []
  let selections: FoodSelection[] = []
  let state: FoodStateRow | null = null
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const row = (prefix: string, value: unknown, index: number) => ({
    ...value,
    createdAt: now,
    id: `${prefix}-${index}`,
    updatedAt: now,
  })
  const summary = () => ({
    actionCount: actions.length,
    actions,
    address: state?.address ?? '',
    query: state?.query ?? '',
    searches,
    selectedCuisine: state?.selectedCuisine ?? '',
    selectedRestaurant: state?.selectedRestaurant ?? '',
    selectionCount: selections.length,
    selections,
  })

  const useQuery = createLakebedQueryStub<typeof foodDeliveryLakebed>({
    restaurantCatalog: () => {
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
    foodDeliveryState: () => {
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

  const useMutation = createLakebedMutationStub<typeof foodDeliveryLakebed>({
    recordFoodAction: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            actions = [
              row(
                'action',
                {
                  action: String(input.action).trim(),
                  source: String(input.source)?.trim() ?? '',
                },
                actions.length + 1,
              ),
              ...actions,
            ]
            notify()
            return actions
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
          (input: Record<string, unknown>) => runMutation(input),
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
    selectRestaurant: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const selectedRestaurant = String(input.name).trim()
            const selectedCuisine = String(input.cuisine)?.trim() ?? ''
            state = row(
              'state',
              {
                address: state?.address ?? '',
                query: state?.query ?? '',
                selectedCuisine,
                selectedRestaurant,
              },
              1,
            )
            selections = [
              row(
                'selection',
                {
                  cuisine: selectedCuisine,
                  name: selectedRestaurant,
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
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: Record<string, unknown>) => runMutation(input),
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
    setFoodSearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const address = String(input.address)?.trim() ?? ''
            const query = String(input.query)?.trim() || address
            state = row(
              'state',
              {
                address,
                query,
                selectedCuisine: '',
                selectedRestaurant: '',
              },
              1,
            )
            searches = [
              row(
                'search',
                {
                  address: state.address,
                  query: state.query,
                },
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
        },
        [],
      )
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(
          (input: Record<string, unknown>) => runMutation(input),
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
    syncRestaurants: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const existingByName = new Map(
              items.map((item) => [item.name.toLowerCase(), item]),
            )

            for (const item of input.items as Record<string, unknown>[]) {
              const nameValue = String(item.name).trim()
              if (!nameValue) continue

              const current = existingByName.get(nameValue.toLowerCase())
              const next = {
                category: String(item.category ?? '').trim() ?? '',
                cuisine: String(item.cuisine ?? '').trim() ?? '',
                delivery: String(item.delivery ?? '').trim() ?? '',
                imageAlt: String(item.imageAlt ?? '').trim() ?? '',
                name: nameValue,
                rating: String(item.rating ?? '').trim() ?? '',
                time: String(item.time ?? '').trim() ?? '',
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
          (input: Record<string, unknown>) => runMutation(input),
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

  const lakebed: FoodDeliveryLakebed = {
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
      actions,
      items,
      searches,
      selections,
      state: state ? [state] : [],
    }),
    useQuery,
    useMutation,
  }

  return {
    actions: () => actions,
    catalog: () => items,
    lakebed,
    searches: () => searches,
    selections: () => selections,
    state: () => state,
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('food delivery fullstack search', () => {
  it('lets hero search filter restaurant cards and record selected restaurants', async () => {
    const { lakebed, searches, selections, state } =
      createFoodDeliveryLakebedStub()
    lakebedRef.current = lakebed
    const Hero = FoodDeliveryHero.client.component
    const Restaurants = FoodDeliveryRestaurants.client.component

    render(
      <>
        <Hero props={{}} statementId="food_delivery_hero" />
        <Restaurants props={{}} statementId="food_delivery_restaurants" />
      </>,
    )

    expect(screen.getByText("Mario's Pizzeria")).toBeTruthy()
    expect(screen.getByText('Sakura Sushi Bar')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Enter your delivery address'), {
      target: { value: 'Sushi' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Find Food' }))

    await waitFor(() =>
      expect(state()).toMatchObject({
        address: 'Sushi',
        query: 'Sushi',
      }),
    )
    expect(searches()).toHaveLength(1)
    expect(screen.getByText('Sakura Sushi Bar')).toBeTruthy()
    expect(screen.queryByText("Mario's Pizzeria")).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Sakura Sushi Bar/i }))
    await waitFor(() => expect(selections()).toHaveLength(1))
    expect(state()).toMatchObject({
      selectedCuisine: 'Japanese',
      selectedRestaurant: 'Sakura Sushi Bar',
    })
  })

  it('lets the restaurant view-all action clear the shared search', async () => {
    const { lakebed, state } = createFoodDeliveryLakebedStub()
    lakebedRef.current = lakebed
    const Hero = FoodDeliveryHero.client.component
    const Restaurants = FoodDeliveryRestaurants.client.component

    render(
      <>
        <Hero props={{}} statementId="food_delivery_hero" />
        <Restaurants props={{}} statementId="food_delivery_restaurants" />
      </>,
    )

    fireEvent.change(screen.getByLabelText('Enter your delivery address'), {
      target: { value: 'Thai' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Find Food' }))
    await waitFor(() =>
      expect(state()).toMatchObject({
        query: 'Thai',
      }),
    )
    expect(screen.getByText('Thai Orchid')).toBeTruthy()
    expect(screen.queryByText('Wing King')).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: /View all 240\+ restaurants/i }),
    )

    await waitFor(() =>
      expect(state()).toMatchObject({
        address: '',
        query: '',
      }),
    )
    expect(screen.getByText('Wing King')).toBeTruthy()
  })

  it('lets navbar command search drive shared restaurant results', async () => {
    const { catalog, lakebed, state } = createFoodDeliveryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = FoodDeliveryNavbar.client.component
    const Restaurants = FoodDeliveryRestaurants.client.component

    render(
      <>
        <Navbar props={{}} statementId="food_delivery_navbar" />
        <Restaurants props={{}} statementId="food_delivery_restaurants" />
      </>,
    )

    await waitFor(() => expect(catalog()).not.toHaveLength(0))

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Search restaurants',
    })
    fireEvent.click(within(dialog).getByText('Sakura Sushi Bar'))

    await waitFor(() =>
      expect(state()).toMatchObject({
        address: '',
        query: 'Sakura Sushi Bar',
      }),
    )
    expect(screen.getByText('Sakura Sushi Bar')).toBeTruthy()
    expect(screen.queryByText("Mario's Pizzeria")).toBeNull()
  })

  it('opens restaurant search when the Lakebed catalog query returns DB-shaped records with malformed rows', async () => {
    const { lakebed } = createFoodDeliveryLakebedStub()
    const malformedCatalogLakebed = {
      ...lakebed,
      useQuery: ((name) => {
        if (name === 'restaurantCatalog') {
          return {
            missing: null,
            restaurant_1: {
              id: 123,
              name: null,
              cuisine: false,
              category: null,
            },
            restaurant_2: {
              id: 'restaurant_2',
              name: 'Sakura Sushi Bar',
              cuisine: 'Japanese',
              category: 'Sushi',
            },
          }
        }
        return lakebed.useQuery(name as never)
      }) as FoodDeliveryLakebed['useQuery'],
    } satisfies FoodDeliveryLakebed

    expect(() =>
      render(<FoodDeliverySearchButton lakebed={malformedCatalogLakebed} />),
    ).not.toThrow()

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Search restaurants',
    })
    expect(within(dialog).getByText('Sakura Sushi Bar')).toBeTruthy()
    expect(within(dialog).getByText('Japanese · Sushi')).toBeTruthy()
  })

  it('records navbar and app-download actions without navigation fallbacks', async () => {
    const { actions, lakebed } = createFoodDeliveryLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = FoodDeliveryNavbar.client.component
    const Cta = FoodDeliveryCta.client.component

    render(
      <>
        <Navbar props={{ getStarted: 'Start Ordering' }} statementId="nav" />
        <Cta
          props={{ appStore: 'App Store', googlePlay: 'Google Play' }}
          statementId="cta"
        />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Start Ordering' }))

    await waitFor(() => expect(actions()).toHaveLength(1))
    expect(actions()[0]).toMatchObject({
      action: 'Start Ordering',
      source: 'navbar',
    })

    fireEvent.click(screen.getByRole('button', { name: 'App Store' }))
    await waitFor(() => expect(actions()).toHaveLength(2))
    expect(actions()[0]).toMatchObject({
      action: 'App Store',
      source: 'cta',
    })
    expect(navigate).not.toHaveBeenCalled()
  })
})
