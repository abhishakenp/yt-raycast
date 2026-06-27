// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { RestaurantLakebed } from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

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
type RestaurantMutationInput =
  | Parameters<typeof restaurantLakebed.mutations.addMenuItem>[1]
  | Parameters<typeof restaurantLakebed.mutations.removeMenuItem>[1]
  | Parameters<typeof restaurantLakebed.mutations.reserveTable>[1]
  | Parameters<typeof restaurantLakebed.mutations.selectMenuItem>[1]
  | Parameters<typeof restaurantLakebed.mutations.syncMenuCatalog>[1]

const navigate = vi.fn()
const lakebedRef: { current: RestaurantLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

type RestaurantMutationName = Extract<
  keyof typeof restaurantLakebed.mutations,
  string
>

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
      return lakebedRef.current
    }),
  useKeyedLakebedMutation: (
    lakebed: RestaurantLakebed,
    name: RestaurantMutationName,
  ) => {
    const mutation = lakebed.useMutation(name)
    const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
    const run = useCallback(
      async (key: string, input?: RestaurantMutationInput) => {
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
  selectDelay,
}: {
  addDelay?: () => Promise<void>
  reserveDelay?: () => Promise<void>
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

  const lakebed: RestaurantLakebed = {
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
      catalog,
      orderItems,
      reservations,
      selections,
      state: [],
    }),
    useQuery: (name) => {
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

      if (name === 'menuCatalog') return catalog
      if (name === 'restaurantExperience') return experience()
      if (name === 'restaurantOrder') return summary()
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      const runMutation = useCallback(
        async (input?: RestaurantMutationInput) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            if (name === 'addMenuItem') {
              await addDelay?.()
              const nextInput =
                input && 'category' in input
                  ? input
                  : {
                      category: '',
                      description: '',
                      name: 'Item',
                      price: '',
                    }
              const existing = orderItems.find(
                (item) => item.name === nextInput.name,
              )

              if (existing) {
                orderItems = orderItems.map((item) =>
                  item.name === nextInput.name
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
                )
              } else {
                orderItems = [
                  ...orderItems,
                  row(
                    'order',
                    {
                      category: nextInput.category,
                      description: nextInput.description ?? '',
                      name: nextInput.name,
                      price: nextInput.price ?? '',
                      quantity: 1,
                      tag: nextInput.tag ?? '',
                    },
                    orderItems.length + 1,
                  ),
                ]
              }

              selections = [
                row(
                  'selection',
                  {
                    category: nextInput.category,
                    name: nextInput.name,
                    price: nextInput.price ?? '',
                    source: 'order',
                  },
                  selections.length + 1,
                ),
                ...selections,
              ]
            }

            if (name === 'clearRestaurantOrder') {
              orderItems = []
            }

            if (name === 'reserveTable') {
              await reserveDelay?.()
              const nextInput =
                input && 'source' in input
                  ? input
                  : {
                      label: '',
                      source: 'Reservations',
                    }
              reservations = [
                row(
                  'reservation',
                  {
                    label: nextInput.label ?? '',
                    source: nextInput.source,
                  },
                  reservations.length + 1,
                ),
                ...reservations,
              ]
            }

            if (name === 'selectMenuItem') {
              await selectDelay?.()
              const nextInput =
                input && 'name' in input
                  ? input
                  : {
                      category: '',
                      name: 'Item',
                      price: '',
                      source: 'search',
                    }
              selectedCategory = nextInput.category
              selectedMenuItem = nextInput.name
              selectedPrice = nextInput.price ?? ''
              selections = [
                row(
                  'selection',
                  {
                    category: nextInput.category,
                    name: nextInput.name,
                    price: nextInput.price ?? '',
                    source: nextInput.source ?? 'search',
                  },
                  selections.length + 1,
                ),
                ...selections,
              ]
            }

            if (name === 'syncMenuCatalog') {
              const nextInput =
                input && 'items' in input
                  ? input
                  : {
                      items: [],
                    }
              for (const item of nextInput.items) {
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
            }

            notify()
            return orderItems
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
          (input?: RestaurantMutationInput) => runMutation(input),
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
