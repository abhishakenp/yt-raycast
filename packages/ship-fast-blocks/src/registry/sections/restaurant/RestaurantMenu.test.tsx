// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import type { RestaurantLakebed } from './restaurant-interactions.tsx'
import {
  restaurantLakebed,
  type RestaurantCatalogInput,
  type RestaurantMenuItemInput,
  type RestaurantOrderItemTarget,
  type RestaurantReservationInput,
} from './restaurant-lakebed.ts'

type RestaurantOrder = ReturnType<
  typeof restaurantLakebed.queries.restaurantOrder
>
type RestaurantCatalogItem = ReturnType<
  typeof restaurantLakebed.queries.menuCatalog
>[number]
type RestaurantOrderItem = RestaurantOrder['items'][number]
type RestaurantExperience = ReturnType<
  typeof restaurantLakebed.queries.restaurantExperience
>
type RestaurantReservation = RestaurantExperience['reservations'][number]
type RestaurantSelection = RestaurantOrder['selections'][number]

const navigate = vi.fn()
const lakebedRef: { current: RestaurantLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

type RestaurantMutationName = Extract<
  keyof typeof restaurantLakebed.mutations,
  string
>

type GenericMutation = ((input?: unknown) => Promise<unknown>) & {
  isPending: boolean
  lastError: unknown | null
  pendingCount: number
  reset(): void
}

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => {
    if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
    return lakebedRef.current
  }),
  useKeyedLakebedMutation: (
    lakebed: RestaurantLakebed,
    name: RestaurantMutationName,
  ) => {
    const mutation = lakebed.useMutation(name) as GenericMutation
    const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
    const run = useCallback(
      async (key: string, input?: unknown) => {
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

    return {
      hasPending: pendingKeys.length > 0,
      isPending,
      lastError: mutation.lastError,
      pendingKey: pendingKeys[0] ?? null,
      pendingKeys,
      reset: mutation.reset,
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

  defineGlobal('document', dom.window.document)
  defineGlobal('CustomEvent', dom.window.CustomEvent)
  defineGlobal('Element', dom.window.Element)
  defineGlobal('Event', dom.window.Event)
  defineGlobal('EventTarget', dom.window.EventTarget)
  defineGlobal('FocusEvent', dom.window.FocusEvent)
  defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement)
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('HTMLInputElement', dom.window.HTMLInputElement)
  defineGlobal('KeyboardEvent', dom.window.KeyboardEvent)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('MutationObserver', dom.window.MutationObserver)
  defineGlobal('Node', dom.window.Node)
  defineGlobal('NodeFilter', dom.window.NodeFilter)
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
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.scrollIntoView === 'undefined'
) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })
}

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { RestaurantMenu } = await import('./RestaurantMenu.tsx')
const { RestaurantNavbar } = await import('./RestaurantNavbar.tsx')
const { RestaurantTestimonials } = await import('./RestaurantTestimonials.tsx')
const { RestaurantGallery } = await import('./RestaurantGallery.tsx')
const { RestaurantStory } = await import('./RestaurantStory.tsx')

const now = '2026-06-26T00:00:00.000Z'

function createDeferred() {
  let resolveDeferred: () => void = () => {}
  const promise = new Promise<void>((resolve) => {
    resolveDeferred = resolve
  })

  return {
    promise,
    resolve: resolveDeferred,
  }
}

function createRestaurantLakebedStub({
  addDelay,
  reserveDelay,
  restaurantOrderOverride,
  selectDelay,
}: {
  addDelay?: () => Promise<void>
  reserveDelay?: () => Promise<void>
  restaurantOrderOverride?: unknown
  selectDelay?: () => Promise<void>
} = {}) {
  let version = 0
  let catalog: RestaurantCatalogItem[] = []
  let orderItems: RestaurantOrderItem[] = []
  let reservations: RestaurantReservation[] = []
  let selections: RestaurantSelection[] = []
  let selectedCategory = ''
  let selectedMenuItem = ''
  let selectedPrice = ''
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
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
    count: orderItems.reduce((total, item) => total + item.quantity, 0),
    items: orderItems,
    lastSelection: selections[0] ?? null,
    selections,
  })
  const experience = () => ({
    reservationCount: reservations.length,
    reservations,
    selectedCategory,
    selectedMenuItem,
    selectedPrice,
  })

  const useQuery = createLakebedQueryStub<typeof restaurantLakebed>({
    menuCatalog: () => {
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
      return catalog
    },
    restaurantExperience: () => {
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
      return experience()
    },
    restaurantOrder: () => {
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
      if (restaurantOrderOverride !== undefined) {
        return restaurantOrderOverride as RestaurantOrder
      }
      return summary()
    },
  })

  const useMutation = createLakebedMutationStub<typeof restaurantLakebed>({
    addMenuItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: RestaurantMenuItemInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await addDelay?.()
            const existing = orderItems.find((item) => item.name === input.name)

            if (existing) {
              orderItems = orderItems.map((item) =>
                item.name === input.name
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              )
            } else {
              orderItems = [
                ...orderItems,
                row(
                  'order',
                  {
                    category: input.category,
                    description: input.description ?? '',
                    name: input.name,
                    price: input.price ?? '',
                    quantity: 1,
                    tag: input.tag ?? '',
                  },
                  orderItems.length + 1,
                ),
              ]
            }

            selections = [
              row(
                'selection',
                {
                  category: input.category,
                  name: input.name,
                  price: input.price ?? '',
                  source: 'order',
                },
                selections.length + 1,
              ),
              ...selections,
            ]

            notify()
            return orderItems
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
          (input: RestaurantMenuItemInput) => runMutation(input),
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
    clearRestaurantOrder: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async () => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          orderItems = []
          notify()
          return []
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [])
      const mutation = useMemo(() => {
        const initialLastError: unknown | null = null
        const callable = Object.assign(() => runMutation(), {
          isPending: false,
          lastError: initialLastError,
          pendingCount: 0,
          reset,
        })
        return callable
      }, [reset, runMutation])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
    removeMenuItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: RestaurantOrderItemTarget) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            orderItems = orderItems.filter((item) => item.name !== input.name)
            notify()
            return orderItems
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
          (input: RestaurantOrderItemTarget) => runMutation(input),
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
    reserveTable: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: RestaurantReservationInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await reserveDelay?.()
            reservations = [
              row(
                'reservation',
                {
                  label: input.label ?? '',
                  source: input.source,
                },
                reservations.length + 1,
              ),
              ...reservations,
            ]
            notify()
            return reservations
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
          (input: RestaurantReservationInput) => runMutation(input),
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
    selectMenuItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input: RestaurantMenuItemInput & { source?: string }) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await selectDelay?.()
            selectedCategory = input.category
            selectedMenuItem = input.name
            selectedPrice = input.price ?? ''
            selections = [
              row(
                'selection',
                {
                  category: input.category,
                  name: input.name,
                  price: input.price ?? '',
                  source: input.source ?? 'search',
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
          (input: RestaurantMenuItemInput & { source?: string }) =>
            runMutation(input),
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
    syncMenuCatalog: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(async (input: RestaurantCatalogInput) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          for (const item of input.items) {
            const existingIndex = catalog.findIndex(
              (current) => current.name === item.name,
            )
            const nextItem = row(
              'catalog',
              {
                category: item.category,
                description: item.description ?? '',
                name: item.name,
                price: item.price ?? '',
                tag: item.tag ?? '',
              },
              existingIndex >= 0 ? existingIndex + 1 : catalog.length + 1,
            )
            if (existingIndex >= 0) {
              catalog = catalog.map((current, index) =>
                index === existingIndex ? nextItem : current,
              )
            } else {
              catalog = [...catalog, nextItem]
            }
          }
          notify()
          return catalog
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
          (input: RestaurantCatalogInput) => runMutation(input),
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

  const lakebed: RestaurantLakebed = {
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
      catalog,
      orderItems,
      reservations,
      selections,
      state: [],
    }),
    useQuery,
    useMutation,
  }

  return {
    catalog: () => catalog,
    lakebed,
    orderItems: () => orderItems,
    reservations: () => reservations,
    selections: () => selections,
    signInWithGoogle: lakebed.signInWithGoogle,
    state: () => experience(),
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('RestaurantMenu fullstack ordering', () => {
  it('renders real generated menu props when the live order payload has no items array', () => {
    const { lakebed } = createRestaurantLakebedStub({
      restaurantOrderOverride: {
        count: 0,
        lastSelection: null,
        selections: [],
      },
    })
    lakebedRef.current = lakebed
    const Menu = RestaurantMenu.client.component

    expect(() =>
      render(
        <Menu
          props={{
            categories: [
              {
                items: [
                  {
                    description: 'Tropical notes with a crisp finish',
                    name: 'Pineapple Saison',
                    price: '$7',
                    tag: 'Limited',
                  },
                  {
                    description: 'Rich cocoa and roasted malt',
                    name: 'Chocolate Stout',
                    price: '$8',
                    tag: 'Seasonal',
                  },
                  {
                    description: 'Balanced hop profile with citrus aroma',
                    name: 'Year-Round Classics>Portland Pale Ale',
                    price: '$6',
                    tag: 'Core',
                  },
                  {
                    description: 'Bold bitterness with pine and mango',
                    name: 'Hoppy IPA',
                    price: '$7',
                    tag: 'Core]',
                  },
                ],
                name: 'categories[Seasonal Releases',
              },
            ],
            description:
              'Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.',
            heading: 'Our Brew Selection',
          }}
          statementId="restaurant_menu"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Our Brew Selection')).toBeTruthy()
    expect(screen.getByText('Pineapple Saison')).toBeTruthy()
    expect(screen.getAllByText('Add').length).toBeGreaterThan(0)
  })

  it('renders real generated menu props when the live order payload has a malformed items object', () => {
    const { lakebed } = createRestaurantLakebedStub({
      restaurantOrderOverride: {
        count: 1,
        items: { stale: true },
        lastSelection: null,
        selections: [],
      },
    })
    lakebedRef.current = lakebed
    const Menu = RestaurantMenu.client.component

    expect(() =>
      render(
        <Menu
          props={{
            categories: [
              {
                items: [
                  {
                    description: 'Wood-fired tomatoes and basil',
                    name: 'Margherita Pizza',
                    price: '$16',
                    tag: 'Popular',
                  },
                ],
                name: 'Pizzas',
              },
            ],
            description: 'Order seasonal favorites from the live table menu.',
            heading: 'Dinner Menu',
          }}
          statementId="restaurant_menu"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Dinner Menu')).toBeTruthy()
    expect(screen.getByText('Margherita Pizza')).toBeTruthy()
    const itemButton = screen.getByRole('button', {
      name: /margherita pizza/i,
    })
    expect(itemButton).toBeTruthy()
    expect(within(itemButton).getByText('Add')).toBeTruthy()
  })

  it('does not crash when generated category data is array-like instead of a real array', () => {
    const { lakebed } = createRestaurantLakebedStub()
    lakebedRef.current = lakebed
    const Menu = RestaurantMenu.client.component

    expect(() =>
      render(
        <Menu
          props={
            {
              categories: {
                0: {
                  items: [
                    {
                      description: 'Citrus and pine over a clean malt base',
                      name: 'Portland Pale Ale',
                      price: '$6',
                    },
                  ],
                  name: 'Drafts',
                },
                length: 1,
              },
              heading: 'Tap List',
            } as unknown as Parameters<typeof Menu>[0]['props']
          }
          statementId="restaurant_menu"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Tap List')).toBeTruthy()
    expect(
      screen.getByText('Tap dishes to build a live table order.'),
    ).toBeTruthy()
    expect(screen.getByText('Burrata & Heirloom Tomato')).toBeTruthy()
  })

  it('shares menu catalog with search, Shoo account, reservations, and mobile navigation', async () => {
    const { catalog, lakebed, reservations, signInWithGoogle, state } =
      createRestaurantLakebedStub()
    lakebedRef.current = lakebed
    const Navbar = RestaurantNavbar.client.component
    const Menu = RestaurantMenu.client.component

    render(
      <>
        <Navbar
          props={{
            brand: 'Table House',
            nav: ['Menu', 'Gallery', 'Reservations'],
          }}
          statementId="restaurant_navbar"
        />
        <Menu
          props={{
            categories: [
              {
                items: [
                  {
                    description: 'Creamy burrata',
                    name: 'Burrata',
                    price: '$16',
                    tag: 'Seasonal',
                  },
                  {
                    description: 'Whole fish with lemon caper',
                    name: 'Branzino',
                    price: '$34',
                  },
                ],
                name: 'Starters',
              },
            ],
          }}
          statementId="restaurant_menu"
        />
      </>,
    )

    await waitFor(() => {
      expect(catalog()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'Starters',
            name: 'Burrata',
            price: '$16',
            tag: 'Seasonal',
          }),
          expect.objectContaining({
            category: 'Starters',
            name: 'Branzino',
            price: '$34',
          }),
        ]),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search menu' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Burrata')).toBeTruthy()
    expect(within(searchDialog).getByText('Branzino')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Burrata'))

    await waitFor(() => {
      expect(state()).toMatchObject({
        selectedCategory: 'Starters',
        selectedMenuItem: 'Burrata',
        selectedPrice: '$16',
      })
    })
    expect(screen.getByText('Selected Burrata from Starters')).toBeTruthy()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Book a Table' }))
    await waitFor(() => {
      expect(reservations()).toMatchObject([
        {
          label: 'Book a Table',
          source: 'Reservations',
        },
      ])
    })
    expect(screen.getByText('1 reservation')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const mobileMenu = await screen.findByRole('dialog')
    fireEvent.click(within(mobileMenu).getByRole('button', { name: 'Gallery' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Gallery')
    })
  })

  it('adds dishes to shared restaurant order state and clears the order', async () => {
    const { lakebed, orderItems, selections } = createRestaurantLakebedStub()
    lakebedRef.current = lakebed
    const Menu = RestaurantMenu.client.component

    render(
      <Menu
        props={{
          categories: [
            {
              items: [
                {
                  description: 'Creamy burrata',
                  name: 'Burrata',
                  price: '$16',
                  tag: 'Seasonal',
                },
              ],
              name: 'Starters',
            },
          ],
        }}
        statementId="restaurant_menu"
      />,
    )

    expect(
      screen.getByText('Tap dishes to build a live table order.'),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Burrata/i }))
    await waitFor(() =>
      expect(orderItems()).toMatchObject([
        {
          category: 'Starters',
          name: 'Burrata',
          price: '$16',
          quantity: 1,
        },
      ]),
    )
    expect(selections()).toHaveLength(1)
    expect(screen.getByText('1 item in the table order')).toBeTruthy()
    expect(screen.getByText('Added 1')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Burrata/i }))
    await waitFor(() =>
      expect(orderItems()).toMatchObject([
        {
          name: 'Burrata',
          quantity: 2,
        },
      ]),
    )
    expect(screen.getByText('2 items in the table order')).toBeTruthy()
    expect(screen.getByText('Added 2')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Clear order' }))
    await waitFor(() => expect(orderItems()).toEqual([]))
    expect(
      screen.getByText('Tap dishes to build a live table order.'),
    ).toBeTruthy()
  })

  it('scopes pending state to the clicked dish row', async () => {
    const addDeferred = createDeferred()
    const { lakebed } = createRestaurantLakebedStub({
      addDelay: () => addDeferred.promise,
    })
    lakebedRef.current = lakebed
    const Menu = RestaurantMenu.client.component

    render(
      <Menu
        props={{
          categories: [
            {
              items: [
                {
                  description: 'Creamy burrata',
                  name: 'Burrata',
                  price: '$16',
                },
                {
                  description: 'Grilled octopus',
                  name: 'Charred Octopus',
                  price: '$19',
                },
              ],
              name: 'Starters',
            },
          ],
        }}
        statementId="restaurant_menu"
      />,
    )

    const burrata = screen.getByRole('button', { name: /Burrata/i })
    const octopus = screen.getByRole('button', { name: /Charred Octopus/i })
    fireEvent.click(burrata)

    await waitFor(() => {
      expect(burrata.getAttribute('aria-busy')).toBe('true')
      expect(octopus.getAttribute('aria-busy')).toBe('false')
    })

    addDeferred.resolve()

    await waitFor(() => {
      expect(burrata.getAttribute('aria-busy')).toBe('false')
      expect(screen.getByText('Added 1')).toBeTruthy()
    })
  })

  it('scopes pending state to the reservation button', async () => {
    const reserveDeferred = createDeferred()
    const { lakebed, reservations } = createRestaurantLakebedStub({
      reserveDelay: () => reserveDeferred.promise,
    })
    lakebedRef.current = lakebed
    const Navbar = RestaurantNavbar.client.component

    render(
      <Navbar
        props={{
          ctaLabel: 'Reserve Patio',
          ctaTarget: 'Patio',
        }}
        statementId="restaurant_navbar"
      />,
    )

    const reserveButton = screen.getByRole('button', {
      name: 'Reserve Patio',
    })
    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(reserveButton.getAttribute('aria-busy')).toBe('true')
    })

    reserveDeferred.resolve()

    await waitFor(() => {
      expect(reserveButton.getAttribute('aria-busy')).toBe('false')
      expect(reservations()).toMatchObject([
        {
          label: 'Reserve Patio',
          source: 'Patio',
        },
      ])
    })
  })
})

describe('RestaurantTestimonials generated review data', () => {
  it('renders real generated string ratings as usable star ratings without leaking malformed fragments', () => {
    lakebedRef.current = createRestaurantLakebedStub().lakebed
    const Testimonials = RestaurantTestimonials.client.component

    render(
      <Testimonials
        props={
          {
            heading: 'What Our Patrons Say',
            reviews: [
              {
                name: 'name',
                quote: 'reviews[quote',
                rating: 'rating]“The Pineapple Saison is a summer must-try!”',
                role: 'role',
              },
              {
                name: 'Javier Lopez',
                quote: 'Loved the tour - the staff are so knowledgeable.',
                rating: '5',
                role: 'Software Engineer',
              },
              {
                name: 'Samantha Reed',
                quote: 'Great vibe, amazing beers, and friendly people.',
                rating: '4',
                role: 'Graphic Designer',
              },
            ],
          } as unknown as Parameters<typeof Testimonials>[0]['props']
        }
        statementId="restaurant_testimonials"
      />,
    )

    expect(screen.getByText('What Our Patrons Say')).toBeTruthy()
    expect(screen.queryByText('Javier Lopez')).toBeTruthy()
    expect(screen.queryByText('Samantha Reed')).toBeTruthy()
    expect(screen.queryByText('Elena Rossi')).toBeNull()
    expect(
      screen.queryByLabelText(
        'rating]“The Pineapple Saison is a summer must-try!” out of 5 stars',
      ),
    ).toBeNull()
    expect(screen.getAllByLabelText('5 out of 5 stars').length).toBeGreaterThan(
      0,
    )
    expect(screen.getByLabelText('4 out of 5 stars')).toBeTruthy()
  })

  it('renders array-like generated reviews without crashing or falling back to defaults', () => {
    lakebedRef.current = createRestaurantLakebedStub().lakebed
    const Testimonials = RestaurantTestimonials.client.component

    expect(() =>
      render(
        <Testimonials
          props={
            {
              heading: 'Generated Guest Notes',
              reviews: {
                0: {
                  name: 'Array-Like Guest',
                  quote: 'The tasting menu held together even with odd data.',
                  rating: '5',
                  source: 'Generated Review',
                },
                length: 1,
              },
            } as unknown as Parameters<typeof Testimonials>[0]['props']
          }
          statementId="restaurant_testimonials"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Generated Guest Notes')).toBeTruthy()
    expect(screen.getByText('Array-Like Guest')).toBeTruthy()
    expect(screen.queryByText('Elena Rossi')).toBeNull()
  })
})

describe('RestaurantGallery generated image data', () => {
  it('renders real generated captionless image rows instead of replacing them with defaults', () => {
    lakebedRef.current = createRestaurantLakebedStub().lakebed
    const Gallery = RestaurantGallery.client.component

    render(
      <Gallery
        props={
          {
            description: 'Snapshots of our space and gatherings.',
            heading: 'Taproom & Events',
            images: [{ alt: 'images[alt]Taproom bar area' }],
          } as unknown as Parameters<typeof Gallery>[0]['props']
        }
        statementId="restaurant_gallery"
      />,
    )

    expect(screen.getByText('Taproom & Events')).toBeTruthy()
    expect(screen.getByAltText('images[alt]Taproom bar area')).toBeTruthy()
    expect(screen.queryByAltText(/Wood-fired whole branzino/i)).toBeNull()
  })

  it('renders array-like generated image rows without crashing or falling back to defaults', () => {
    lakebedRef.current = createRestaurantLakebedStub().lakebed
    const Gallery = RestaurantGallery.client.component

    expect(() =>
      render(
        <Gallery
          props={
            {
              heading: 'Generated Gallery',
              images: {
                0: {
                  alt: 'Array-like dining room image',
                  caption: 'Dining room',
                },
                length: 1,
              },
            } as unknown as Parameters<typeof Gallery>[0]['props']
          }
          statementId="restaurant_gallery"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Generated Gallery')).toBeTruthy()
    expect(screen.getByAltText('Array-like dining room image')).toBeTruthy()
    expect(screen.queryByAltText(/Wood-fired whole branzino/i)).toBeNull()
  })
})

describe('RestaurantStory generated feature data', () => {
  it('renders array-like generated story features without crashing or falling back to defaults', () => {
    lakebedRef.current = createRestaurantLakebedStub().lakebed
    const Story = RestaurantStory.client.component

    expect(() =>
      render(
        <Story
          props={
            {
              features: {
                0: {
                  title: 'Array-Like Prep',
                  description: 'Feature metadata arrived as an indexed object.',
                },
                length: 1,
              },
              heading: 'Generated Story',
            } as unknown as Parameters<typeof Story>[0]['props']
          }
          statementId="restaurant_story"
        />,
      ),
    ).not.toThrow()

    expect(screen.getByText('Generated Story')).toBeTruthy()
    expect(screen.getByText('Array-Like Prep')).toBeTruthy()
    expect(screen.queryByText('18-Hour Tonkotsu')).toBeNull()
  })
})
