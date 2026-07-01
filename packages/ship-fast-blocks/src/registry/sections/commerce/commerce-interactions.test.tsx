// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import type { LakebedMutationsOf } from '@ship-fast/lakebed/server'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commerceCartItemKey, commerceCartLakebed } from './cart-lakebed.ts'
import type { CommerceLakebed } from './commerce-interactions.tsx'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
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
  defineGlobal('HTMLTextAreaElement', dom.window.HTMLTextAreaElement)
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

if (typeof requestAnimationFrame === 'undefined') {
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) =>
      setTimeout(() => callback(Date.now()), 0),
    writable: true,
  })
}

if (typeof cancelAnimationFrame === 'undefined') {
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: (id: number) => clearTimeout(id),
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
const {
  CommerceAddItemButton,
  CommerceAccountButton,
  CommerceCartButton,
  CommerceMobileMenu,
  CommerceMutationSpinner,
  CommerceSearchButton,
  useCommerceFilteredProducts,
} = await import('./commerce-interactions.tsx')

type TestCartItem = {
  createdAt: string
  id: string
  itemKey?: string
  label: string
  price?: string
  quantity: number
  updatedAt: string
}

type TestProduct = {
  createdAt: string
  id: string
  imageAlt?: string
  itemKey?: string
  label: string
  price?: string
  subtitle?: string
  updatedAt: string
}

type TestCommerceSearch = {
  createdAt: string
  id: string
  query: string
  selectedLabel: string
  updatedAt: string
}

type TestCartItemInput = Omit<TestCartItem, 'createdAt' | 'updatedAt'>

type TestProductInput = Omit<TestProduct, 'createdAt' | 'updatedAt'>

type TestCommerceSearchInput = Omit<
  TestCommerceSearch,
  'createdAt' | 'updatedAt'
>

type CommerceMutations = LakebedMutationsOf<typeof commerceCartLakebed>

type CommerceMutationMap = {
  [Name in keyof CommerceMutations]: LakebedMutationFunction<
    CommerceMutations[Name]
  >
}

type MutationArgs<TMutation> = TMutation extends (
  ctx: unknown,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: ReadonlyArray<unknown>
) => infer TResult
  ? Awaited<TResult>
  : never

type TestMutationInput = {
  id?: string
  itemKey?: string
  label?: string
  price?: string
  products?: TestProductInput[]
  query?: string
  selectedLabel?: string
}

const timestamp = '2026-06-26T00:00:00.000Z'

const testCartItem = (item: TestCartItemInput): TestCartItem => ({
  createdAt: timestamp,
  updatedAt: timestamp,
  ...item,
})

const testProduct = (product: TestProductInput): TestProduct => ({
  createdAt: timestamp,
  imageAlt: '',
  price: '',
  subtitle: '',
  updatedAt: timestamp,
  ...product,
})

const testCommerceSearch = (
  search: TestCommerceSearchInput,
): TestCommerceSearch => ({
  createdAt: timestamp,
  updatedAt: timestamp,
  ...search,
})

const publicCartItem = ({
  id,
  itemKey,
  label,
  price,
  quantity,
}: TestCartItem): TestCartItemInput => ({
  id,
  itemKey,
  label,
  price,
  quantity,
})

const publicProduct = ({
  id,
  imageAlt,
  itemKey,
  label,
  price,
  subtitle,
}: TestProduct): TestProductInput => ({
  id,
  imageAlt,
  itemKey,
  label,
  price,
  subtitle,
})

function useTestLakebedMutation<TMutation>({
  lastError,
  pendingCount,
  reset,
  runMutation,
}: {
  lastError: unknown | null
  pendingCount: number
  reset(): void
  runMutation(
    ...args: MutationArgs<TMutation>
  ): Promise<MutationResult<TMutation>>
}): LakebedMutationFunction<TMutation> {
  const emptyLastError: unknown | null = null
  const mutation = useMemo(
    () =>
      Object.assign(
        (...args: MutationArgs<TMutation>) => runMutation(...args),
        {
          isPending: false,
          lastError: emptyLastError,
          pendingCount: 0,
          reset,
        },
      ),
    [reset, runMutation],
  )

  mutation.isPending = pendingCount > 0
  mutation.lastError = lastError
  mutation.pendingCount = pendingCount
  mutation.reset = reset

  return mutation
}

function useCommerceTestMutation({
  findItem,
  mutationDelay,
  name,
  notify,
  state,
}: {
  findItem(input: { id?: string; label?: string }): TestCartItem | undefined
  mutationDelay?: Record<string, () => Promise<unknown>>
  name: keyof CommerceMutations
  notify(): void
  state: {
    items: TestCartItem[]
    products: TestProduct[]
    searches: TestCommerceSearch[]
    searchState: {
      query: string
      selectedLabel: string
    }
  }
}): CommerceMutationMap[keyof CommerceMutationMap] {
  const [pendingCount, setPendingCount] = useState(0)
  const [lastError, setLastError] = useState<unknown | null>(null)
  const reset = useCallback(() => {
    setLastError(null)
  }, [])

  if (name === 'syncCatalog') {
    return useTestLakebedMutation<
      typeof commerceCartLakebed.mutations.syncCatalog
    >({
      lastError,
      pendingCount,
      reset,
      runMutation: useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await mutationDelay?.[name]?.()
            state.products = input.products.map((product, index) =>
              testProduct({
                id: `product-${index + 1}`,
                ...product,
              }),
            )
            notify()
            return state.products
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name, notify, state],
      ),
    })
  }

  if (name === 'clearCart') {
    return useTestLakebedMutation<
      typeof commerceCartLakebed.mutations.clearCart
    >({
      lastError,
      pendingCount,
      reset,
      runMutation: useCallback(async () => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          await mutationDelay?.[name]?.()
          state.items = []
          notify()
          return []
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      }, [name, notify, state]),
    })
  }

  if (name === 'setCommerceSearch') {
    return useTestLakebedMutation<
      typeof commerceCartLakebed.mutations.setCommerceSearch
    >({
      lastError,
      pendingCount,
      reset,
      runMutation: useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await mutationDelay?.[name]?.()
            const next = {
              query: String(input.query ?? '').trim(),
              selectedLabel: String(input.selectedLabel ?? '').trim(),
            }
            state.searchState = next
            state.searches = [
              testCommerceSearch({
                id: `search-${state.searches.length + 1}`,
                ...next,
              }),
              ...state.searches,
            ]
            notify()
            return [testCommerceSearch({ id: 'state-1', ...next })]
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [name, notify, state],
      ),
    })
  }

  if (name === 'addItem') {
    return useTestLakebedMutation<typeof commerceCartLakebed.mutations.addItem>(
      {
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.[name]?.()
              const existing = findItem(input)
              const label = input.label?.trim() || 'Item'
              const itemKey = commerceCartItemKey({
                itemKey: input.itemKey,
                label,
                price: input.price,
              })
              if (existing) {
                existing.itemKey = existing.itemKey || itemKey
                existing.quantity += 1
                existing.updatedAt = timestamp
              } else {
                state.items = [
                  ...state.items,
                  testCartItem({
                    id: `item-${state.items.length + 1}`,
                    itemKey,
                    label,
                    price: input.price,
                    quantity: 1,
                  }),
                ]
              }
              notify()
              return state.items
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              setPendingCount((count) => Math.max(0, count - 1))
            }
          },
          [findItem, name, notify, state],
        ),
      },
    )
  }

  if (name === 'incrementItem') {
    return useTestLakebedMutation<
      typeof commerceCartLakebed.mutations.incrementItem
    >({
      lastError,
      pendingCount,
      reset,
      runMutation: useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await mutationDelay?.[name]?.()
            const item = findItem(input)
            if (item) {
              item.quantity += 1
              item.updatedAt = timestamp
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [findItem, name, notify, state],
      ),
    })
  }

  if (name === 'decrementItem' || name === 'removeItem') {
    return useTestLakebedMutation<
      typeof commerceCartLakebed.mutations.decrementItem
    >({
      lastError,
      pendingCount,
      reset,
      runMutation: useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            await mutationDelay?.[name]?.()
            const item = findItem(input)
            if (item && item.quantity > 1) {
              item.quantity -= 1
              item.updatedAt = timestamp
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        },
        [findItem, name, notify, state],
      ),
    })
  }

  return useTestLakebedMutation<
    typeof commerceCartLakebed.mutations.deleteItem
  >({
    lastError,
    pendingCount,
    reset,
    runMutation: useCallback(
      async (input) => {
        setPendingCount((count) => count + 1)
        setLastError(null)
        try {
          await mutationDelay?.[name]?.()
          state.items = state.items.filter((item) => item.id !== input.id)
          notify()
          return state.items
        } catch (error) {
          setLastError(error)
          throw error
        } finally {
          setPendingCount((count) => Math.max(0, count - 1))
        }
      },
      [name, notify, state],
    ),
  })
}

function createCommerceLakebedStub({
  auth = {
    isAuthenticated: false,
    user: { displayName: 'Guest', email: '', isGuest: true },
  },
  items = [],
  mutationDelay,
  products = [],
}: {
  auth?: ReturnType<CommerceLakebed['useAuth']>
  items?: TestCartItemInput[]
  mutationDelay?: Record<string, () => Promise<unknown>>
  products?: TestProductInput[]
} = {}) {
  let version = 0
  const state = {
    items: items.map(testCartItem),
    products: products.map(testProduct),
    searches: [],
    searchState: {
      query: '',
      selectedLabel: '',
    },
  }
  const listeners = new Set<() => void>()
  const signInWithGoogle = vi.fn(async () => undefined)
  const signOut = vi.fn()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const findItem = (input: TestMutationInput) =>
    state.items.find((item) => {
      if (input.id && item.id === input.id) return true
      if (input.itemKey && item.itemKey === input.itemKey) return true
      if (
        input.label &&
        item.label === input.label &&
        (input.price === undefined || item.price === input.price)
      ) {
        return true
      }
      return false
    })
  const summary = () => ({
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    items: state.items,
  })

  const lakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => auth,
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

      if (name === 'cartSummary') return summary()
      if (name === 'productCatalog') return state.products
      if (name === 'commerceSearchState') {
        return {
          query: state.searchState.query,
          searches: state.searches,
          selectedLabel: state.searchState.selectedLabel,
        }
      }
      return null
    },
    useMutation: (name) =>
      useCommerceTestMutation({
        findItem,
        mutationDelay,
        name,
        notify,
        state,
      }),
  } satisfies CommerceLakebed

  return {
    lakebed,
    signInWithGoogle,
    signOut,
    state: () => ({
      items: state.items.map(publicCartItem),
      products: state.products.map(publicProduct),
      searches: state.searches.map(({ id, query, selectedLabel }) => ({
        id,
        query,
        selectedLabel,
      })),
      searchState: state.searchState,
    }),
  }
}

function createSharedPendingCommerceLakebedStub({
  items = [],
  mutationDelay,
}: {
  items?: TestCartItemInput[]
  mutationDelay?: Record<string, () => Promise<unknown>>
} = {}) {
  let version = 0
  const pendingByName: Record<string, number> = {}
  const initialProducts: TestProduct[] = []
  let state = {
    items: items.map(testCartItem),
    products: initialProducts,
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }

  const lakebed = {
    signInWithGoogle: vi.fn(async () => undefined),
    signOut: vi.fn(),
    useAuth: () => ({
      isAuthenticated: false,
      user: { displayName: 'Guest', email: '', isGuest: true },
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

      if (name === 'cartSummary') {
        return {
          count: state.items.reduce((total, item) => total + item.quantity, 0),
          items: state.items,
        }
      }
      if (name === 'productCatalog') return state.products
      return null
    },
    useMutation: (name) => {
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
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])

      if (name === 'clearCart') {
        return useTestLakebedMutation<
          typeof commerceCartLakebed.mutations.clearCart
        >({
          lastError,
          pendingCount: pendingByName[name] ?? 0,
          reset,
          runMutation: useCallback(async () => {
            pendingByName[name] = (pendingByName[name] ?? 0) + 1
            notify()
            try {
              await mutationDelay?.[name]?.()
              state = { ...state, items: [] }
              notify()
              return []
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              pendingByName[name] = Math.max(0, (pendingByName[name] ?? 0) - 1)
              notify()
            }
          }, [name]),
        })
      }

      if (name === 'addItem') {
        return useTestLakebedMutation<
          typeof commerceCartLakebed.mutations.addItem
        >({
          lastError,
          pendingCount: pendingByName[name] ?? 0,
          reset,
          runMutation: useCallback(
            async (input) => {
              pendingByName[name] = (pendingByName[name] ?? 0) + 1
              notify()
              try {
                await mutationDelay?.[name]?.()
                const label = input.label?.trim() || 'Item'
                const itemKey = commerceCartItemKey({
                  itemKey: input.itemKey,
                  label,
                  price: input.price,
                })
                const existing = state.items.find(
                  (item) => item.itemKey === itemKey,
                )
                const nextItems = existing
                  ? state.items.map((item) =>
                      item.id === existing.id
                        ? {
                            ...item,
                            itemKey: item.itemKey || itemKey,
                            quantity: item.quantity + 1,
                            updatedAt: timestamp,
                          }
                        : item,
                    )
                  : [
                      ...state.items,
                      testCartItem({
                        id: `item-${state.items.length + 1}`,
                        itemKey,
                        label,
                        price: input.price,
                        quantity: 1,
                      }),
                    ]
                state = {
                  ...state,
                  items: nextItems,
                }
                notify()
                return state.items
              } catch (error) {
                setLastError(error)
                throw error
              } finally {
                pendingByName[name] = Math.max(
                  0,
                  (pendingByName[name] ?? 0) - 1,
                )
                notify()
              }
            },
            [name],
          ),
        })
      }

      if (name === 'incrementItem') {
        return useTestLakebedMutation<
          typeof commerceCartLakebed.mutations.incrementItem
        >({
          lastError,
          pendingCount: pendingByName[name] ?? 0,
          reset,
          runMutation: useCallback(
            async (input) => {
              pendingByName[name] = (pendingByName[name] ?? 0) + 1
              notify()
              try {
                await mutationDelay?.[name]?.()
                state = {
                  ...state,
                  items: state.items.map((item) =>
                    item.id === input.id
                      ? {
                          ...item,
                          quantity: item.quantity + 1,
                          updatedAt: timestamp,
                        }
                      : item,
                  ),
                }
                notify()
                return state.items
              } catch (error) {
                setLastError(error)
                throw error
              } finally {
                pendingByName[name] = Math.max(
                  0,
                  (pendingByName[name] ?? 0) - 1,
                )
                notify()
              }
            },
            [name],
          ),
        })
      }

      if (name === 'decrementItem' || name === 'removeItem') {
        return useTestLakebedMutation<
          typeof commerceCartLakebed.mutations.decrementItem
        >({
          lastError,
          pendingCount: pendingByName[name] ?? 0,
          reset,
          runMutation: useCallback(
            async (input) => {
              pendingByName[name] = (pendingByName[name] ?? 0) + 1
              notify()
              try {
                await mutationDelay?.[name]?.()
                state = {
                  ...state,
                  items: state.items.map((item) =>
                    item.id === input.id && item.quantity > 1
                      ? {
                          ...item,
                          quantity: item.quantity - 1,
                          updatedAt: timestamp,
                        }
                      : item,
                  ),
                }
                notify()
                return state.items
              } catch (error) {
                setLastError(error)
                throw error
              } finally {
                pendingByName[name] = Math.max(
                  0,
                  (pendingByName[name] ?? 0) - 1,
                )
                notify()
              }
            },
            [name],
          ),
        })
      }

      if (name === 'deleteItem') {
        return useTestLakebedMutation<
          typeof commerceCartLakebed.mutations.deleteItem
        >({
          lastError,
          pendingCount: pendingByName[name] ?? 0,
          reset,
          runMutation: useCallback(
            async (input) => {
              pendingByName[name] = (pendingByName[name] ?? 0) + 1
              notify()
              try {
                await mutationDelay?.[name]?.()
                state = {
                  ...state,
                  items: state.items.filter((item) => item.id !== input.id),
                }
                notify()
                return state.items
              } catch (error) {
                setLastError(error)
                throw error
              } finally {
                pendingByName[name] = Math.max(
                  0,
                  (pendingByName[name] ?? 0) - 1,
                )
                notify()
              }
            },
            [name],
          ),
        })
      }

      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.syncCatalog
      >({
        lastError,
        pendingCount: pendingByName[name] ?? 0,
        reset,
        runMutation: useCallback(
          async (input) => {
            pendingByName[name] = (pendingByName[name] ?? 0) + 1
            notify()
            try {
              await mutationDelay?.[name]?.()
              state = {
                ...state,
                products: input.products.map((product, index) =>
                  testProduct({
                    id: `product-${index + 1}`,
                    ...product,
                  }),
                ),
              }
              notify()
              return state.products
            } catch (error) {
              setLastError(error)
              throw error
            } finally {
              pendingByName[name] = Math.max(0, (pendingByName[name] ?? 0) - 1)
              notify()
            }
          },
          [name],
        ),
      })
    },
  } satisfies CommerceLakebed

  return {
    lakebed,
    state: () => ({
      items: state.items.map(publicCartItem),
      products: state.products.map(publicProduct),
    }),
  }
}

function createDeferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  document.body.removeAttribute('style')
})

describe('commerce interaction surfaces', () => {
  it('renders a theme-aware cart drawer with working quantity controls', async () => {
    const { lakebed } = createCommerceLakebedStub({
      items: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          quantity: 2,
        },
      ],
    })

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))

    const drawer = screen.getByRole('dialog')
    expect(drawer.getAttribute('class') ?? '').toMatch(/bg-background/)
    expect(drawer.getAttribute('class') ?? '').toMatch(
      /w-\[min\(100%,22rem\)\]/,
    )
    expect(screen.getByText('You have 2 items in your cart.')).toBeTruthy()
    expect(screen.getByText('Hydrating Serum')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'View full cart' })).toBeNull()
    expect(navigate).not.toHaveBeenCalledWith('Cart')
    expect(screen.getByLabelText('Hydrating Serum quantity').textContent).toBe(
      '2',
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Increase Hydrating Serum quantity',
      }),
    )
    await waitFor(() => {
      expect(screen.getByText('You have 3 items in your cart.')).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Decrease Hydrating Serum quantity',
      }),
    )
    await waitFor(() => {
      expect(screen.getByText('You have 2 items in your cart.')).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Decrease Hydrating Serum quantity',
      }),
    )
    await waitFor(() => {
      expect(screen.getByText('You have 1 item in your cart.')).toBeTruthy()
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Decrease Hydrating Serum quantity',
      }),
    )
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(screen.getByText('Delete Hydrating Serum?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('You have 1 item in your cart.')).toBeTruthy()
    })
  })

  it('renders the cart drawer when cartSummary omits the items array', () => {
    const noopMutation = Object.assign(
      vi.fn(async () => []),
      {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset: vi.fn(),
      },
    )
    const lakebed = {
      useMutation: () => noopMutation,
      useQuery: (name: string) =>
        name === 'cartSummary' ? { count: 3 } : null,
    } as unknown as CommerceLakebed

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('You have 3 items in your cart.')).toBeTruthy()
    expect(
      screen.getByText('Add a product to see it here instantly.'),
    ).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Clear cart' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('uses destructive alert dialogs for item deletion and cart clearing', async () => {
    const { lakebed } = createCommerceLakebedStub({
      items: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          quantity: 1,
        },
        {
          id: 'cream',
          label: 'Barrier Cream',
          price: '$34',
          quantity: 1,
        },
      ],
    })

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Hydrating Serum' }),
    )

    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(screen.getByText('Delete Hydrating Serum?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }))

    await waitFor(() => {
      expect(screen.queryByText('Hydrating Serum')).toBeNull()
      expect(screen.getByText('Barrier Cream')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }))
    expect(screen.getByText('Clear cart?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }))

    await waitFor(() => {
      expect(screen.getByText('Your bag is empty.')).toBeTruthy()
    })
  })

  it('keeps cart mutation controls disabled and busy while a mutation is pending', async () => {
    const increment = createDeferred()
    const { lakebed } = createCommerceLakebedStub({
      items: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          quantity: 2,
        },
      ],
      mutationDelay: {
        incrementItem: () => increment.promise,
      },
    })

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const incrementButton = screen.getByRole('button', {
      name: 'Increase Hydrating Serum quantity',
    })

    fireEvent.click(incrementButton)

    await waitFor(() => {
      expect(incrementButton.getAttribute('aria-busy')).toBe('true')
      expect(incrementButton.hasAttribute('disabled')).toBe(true)
    })

    increment.resolve()

    await waitFor(() => {
      expect(screen.getByText('You have 3 items in your cart.')).toBeTruthy()
      expect(incrementButton.getAttribute('aria-busy')).toBe('false')
      expect(incrementButton.hasAttribute('disabled')).toBe(false)
    })
  })

  it('scopes cart drawer loading state to the row action that started it', async () => {
    const increment = createDeferred()
    const { lakebed } = createSharedPendingCommerceLakebedStub({
      items: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          quantity: 2,
        },
        {
          id: 'cream',
          label: 'Barrier Cream',
          price: '$34',
          quantity: 2,
        },
      ],
      mutationDelay: {
        incrementItem: () => increment.promise,
      },
    })

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const serumIncrement = screen.getByRole('button', {
      name: 'Increase Hydrating Serum quantity',
    })
    const serumDecrement = screen.getByRole('button', {
      name: 'Decrease Hydrating Serum quantity',
    })
    const serumDelete = screen.getByRole('button', {
      name: 'Delete Hydrating Serum',
    })
    const creamIncrement = screen.getByRole('button', {
      name: 'Increase Barrier Cream quantity',
    })

    fireEvent.click(serumIncrement)

    await waitFor(() => {
      expect(serumIncrement.getAttribute('aria-busy')).toBe('true')
      expect(serumIncrement.hasAttribute('disabled')).toBe(true)
      expect(serumDecrement.getAttribute('aria-busy')).toBe('false')
      expect(serumDecrement.hasAttribute('disabled')).toBe(false)
      expect(serumDelete.getAttribute('aria-busy')).toBe('false')
      expect(serumDelete.hasAttribute('disabled')).toBe(false)
      expect(creamIncrement.getAttribute('aria-busy')).toBe('false')
      expect(creamIncrement.hasAttribute('disabled')).toBe(false)
    })

    increment.resolve()

    await waitFor(() => {
      expect(serumIncrement.getAttribute('aria-busy')).toBe('false')
      expect(screen.getByText('You have 5 items in your cart.')).toBeTruthy()
    })
  })

  it('shows spinner-only destructive confirmation buttons while cart deletes are pending', async () => {
    const deleteDeferred = createDeferred()
    const clearDeferred = createDeferred()
    const { lakebed } = createSharedPendingCommerceLakebedStub({
      items: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          quantity: 1,
        },
        {
          id: 'cream',
          label: 'Barrier Cream',
          price: '$34',
          quantity: 1,
        },
      ],
      mutationDelay: {
        clearCart: () => clearDeferred.promise,
        deleteItem: () => deleteDeferred.promise,
      },
    })

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Hydrating Serum' }),
    )

    const deleteConfirm = screen.getByRole('button', { name: 'Delete item' })
    fireEvent.click(deleteConfirm)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deleting item' })).toBeTruthy()
      expect(deleteConfirm.textContent).toBe('')
    })

    deleteDeferred.resolve()

    await waitFor(() => {
      expect(screen.queryByText('Hydrating Serum')).toBeNull()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }))
    const clearConfirm = screen.getByRole('button', { name: 'Clear cart' })
    fireEvent.click(clearConfirm)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clearing cart' })).toBeTruthy()
      expect(clearConfirm.textContent).toBe('')
    })

    clearDeferred.resolve()

    await waitFor(() => {
      expect(screen.getByText('Your bag is empty.')).toBeTruthy()
    })
  })

  it('exposes Lakebed mutation pending state for add-to-cart buttons', async () => {
    const add = createDeferred()
    const { lakebed } = createCommerceLakebedStub({
      mutationDelay: {
        addItem: () => add.promise,
      },
    })

    function AddButtonProbe() {
      const addItem = lakebed.useMutation('addItem')

      return (
        <button
          type="button"
          aria-busy={addItem.isPending}
          disabled={addItem.isPending}
          onClick={() => {
            void addItem({ label: 'Serum', price: '$28' })
          }}
        >
          {addItem.isPending ? <CommerceMutationSpinner /> : null}
          {addItem.isPending ? 'Adding' : 'Add to cart'}
        </button>
      )
    }

    render(<AddButtonProbe />)

    const button = screen.getByRole('button', { name: 'Add to cart' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button.textContent).toContain('Adding')
      expect(button.getAttribute('aria-busy')).toBe('true')
      expect(button.hasAttribute('disabled')).toBe(true)
    })

    add.resolve()

    await waitFor(() => {
      expect(button.textContent).toContain('Add to cart')
      expect(button.getAttribute('aria-busy')).toBe('false')
      expect(button.hasAttribute('disabled')).toBe(false)
    })
  })

  it('scopes add-to-cart loading state to the clicked product button', async () => {
    const add = createDeferred()
    const { lakebed } = createCommerceLakebedStub({
      mutationDelay: {
        addItem: () => add.promise,
      },
    })

    render(
      <>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{ label: 'Serum', price: '$28' }}
          pendingChildren={
            <>
              <CommerceMutationSpinner />
              Adding Serum
            </>
          }
        >
          Add Serum
        </CommerceAddItemButton>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{ label: 'Cream', price: '$34' }}
          pendingChildren={
            <>
              <CommerceMutationSpinner />
              Adding Cream
            </>
          }
        >
          Add Cream
        </CommerceAddItemButton>
      </>,
    )

    const serumButton = screen.getByRole('button', { name: 'Add Serum' })
    const creamButton = screen.getByRole('button', { name: 'Add Cream' })

    fireEvent.click(serumButton)

    await waitFor(() => {
      expect(serumButton.textContent).toContain('Adding Serum')
      expect(serumButton.getAttribute('aria-busy')).toBe('true')
      expect(creamButton.textContent).toContain('Add Cream')
      expect(creamButton.getAttribute('aria-busy')).toBe('false')
      expect(creamButton.hasAttribute('disabled')).toBe(false)
    })

    add.resolve()

    await waitFor(() => {
      expect(serumButton.textContent).toContain('Add Serum')
      expect(serumButton.getAttribute('aria-busy')).toBe('false')
    })
  })

  it('adds duplicate product labels as distinct cart rows when item keys differ', async () => {
    const { lakebed, state } = createCommerceLakebedStub()

    render(
      <>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{
            itemKey: 'variant:serum-small',
            label: 'Hydrating Serum',
            price: '$28',
          }}
        >
          Add small serum
        </CommerceAddItemButton>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{
            itemKey: 'variant:serum-large',
            label: 'Hydrating Serum',
            price: '$42',
          }}
        >
          Add large serum
        </CommerceAddItemButton>
        <CommerceCartButton lakebed={lakebed} />
      </>,
    )

    const addSmall = () =>
      fireEvent.click(screen.getByRole('button', { name: 'Add small serum' }))
    const addLarge = () =>
      fireEvent.click(screen.getByRole('button', { name: 'Add large serum' }))

    addSmall()
    await waitFor(() => {
      expect(state().items).toHaveLength(1)
    })
    addLarge()
    await waitFor(() => {
      expect(state().items).toHaveLength(2)
    })
    addSmall()

    await waitFor(() => {
      expect(state().items).toMatchObject([
        {
          itemKey: 'variant:serum-small',
          quantity: 2,
        },
        {
          itemKey: 'variant:serum-large',
          quantity: 1,
        },
      ])
      expect(screen.getByRole('button', { name: 'Cart' }).textContent).toMatch(
        /3/,
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))

    expect(screen.getByText('You have 3 items in your cart.')).toBeTruthy()
    expect(screen.getByText('$28')).toBeTruthy()
    expect(screen.getByText('$42')).toBeTruthy()
    expect(screen.getAllByText('Hydrating Serum')).toHaveLength(2)
  })

  it('does not light up every product button when an add mutation is globally pending', async () => {
    const add = createDeferred()
    const { lakebed } = createSharedPendingCommerceLakebedStub({
      mutationDelay: {
        addItem: () => add.promise,
      },
    })

    render(
      <>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{ label: 'Serum', price: '$28' }}
          pendingChildren={
            <>
              <CommerceMutationSpinner />
              Adding Serum
            </>
          }
        >
          Add Serum
        </CommerceAddItemButton>
        <CommerceAddItemButton
          lakebed={lakebed}
          item={{ label: 'Cream', price: '$34' }}
          pendingChildren={
            <>
              <CommerceMutationSpinner />
              Adding Cream
            </>
          }
        >
          Add Cream
        </CommerceAddItemButton>
      </>,
    )

    const serumButton = screen.getByRole('button', { name: 'Add Serum' })
    const creamButton = screen.getByRole('button', { name: 'Add Cream' })

    fireEvent.click(serumButton)

    await waitFor(() => {
      expect(serumButton.textContent).toContain('Adding Serum')
      expect(serumButton.getAttribute('aria-busy')).toBe('true')
      expect(creamButton.textContent).toContain('Add Cream')
      expect(creamButton.getAttribute('aria-busy')).toBe('false')
      expect(creamButton.hasAttribute('disabled')).toBe(false)
    })

    add.resolve()

    await waitFor(() => {
      expect(serumButton.textContent).toContain('Add Serum')
      expect(serumButton.getAttribute('aria-busy')).toBe('false')
    })
  })

  it('opens product search from the shared catalog and stores selected products in Lakebed state', async () => {
    const { lakebed, state } = createCommerceLakebedStub({
      products: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          subtitle: 'Daily skincare',
        },
      ],
    })

    render(<CommerceSearchButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Hydrating Serum')).toBeTruthy()
    expect(screen.getByText('Daily skincare · $28')).toBeTruthy()

    fireEvent.click(screen.getByText('Hydrating Serum'))

    await waitFor(() => {
      expect(state().searchState).toEqual({
        query: 'Hydrating Serum',
        selectedLabel: 'Hydrating Serum',
      })
      expect(state().searches).toEqual([
        {
          id: 'search-1',
          query: 'Hydrating Serum',
          selectedLabel: 'Hydrating Serum',
        },
      ])
    })
    expect(navigate).not.toHaveBeenCalledWith('Hydrating Serum')
  })

  it('filters product views from the shared Lakebed search state', async () => {
    const { lakebed } = createCommerceLakebedStub({
      products: [
        {
          id: 'serum',
          label: 'Hydrating Serum',
          price: '$28',
          subtitle: 'Daily skincare',
        },
        {
          id: 'cream',
          label: 'Barrier Cream',
          price: '$34',
          subtitle: 'Night repair',
        },
      ],
    })

    function ProductFilterProbe() {
      const products = [
        {
          label: 'Hydrating Serum',
          price: '$28',
          subtitle: 'Daily skincare',
        },
        {
          label: 'Barrier Cream',
          price: '$34',
          subtitle: 'Night repair',
        },
      ]
      const visibleProducts = useCommerceFilteredProducts(
        lakebed,
        products,
        (product) => [product.label, product.subtitle, product.price],
      )

      return (
        <ul aria-label="Visible products">
          {visibleProducts.map((product) => (
            <li key={product.label}>{product.label}</li>
          ))}
        </ul>
      )
    }

    render(
      <>
        <ProductFilterProbe />
        <CommerceSearchButton lakebed={lakebed} />
      </>,
    )

    const visibleList = screen.getByRole('list', { name: 'Visible products' })
    expect(within(visibleList).getByText('Hydrating Serum')).toBeTruthy()
    expect(within(visibleList).getByText('Barrier Cream')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = screen.getByRole('dialog')
    fireEvent.change(screen.getByPlaceholderText('Search products...'), {
      target: { value: 'Barrier' },
    })

    await waitFor(() => {
      expect(within(visibleList).queryByText('Hydrating Serum')).toBeNull()
      expect(within(visibleList).getByText('Barrier Cream')).toBeTruthy()
    })

    fireEvent.click(within(searchDialog).getByText('Barrier Cream'))

    await waitFor(() => {
      expect(within(visibleList).queryByText('Hydrating Serum')).toBeNull()
      expect(within(visibleList).getByText('Barrier Cream')).toBeTruthy()
    })
  })

  it('persists the latest product search query typed while an earlier query is pending', async () => {
    const firstSearch = createDeferred()
    const secondSearch = createDeferred()
    let searchCalls = 0
    const setCommerceSearch = vi.fn(async () => {
      searchCalls += 1
      if (searchCalls === 1) return firstSearch.promise
      return secondSearch.promise
    })
    const { lakebed, state } = createCommerceLakebedStub({
      mutationDelay: { setCommerceSearch },
    })

    render(<CommerceSearchButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 's' } })
    fireEvent.change(input, { target: { value: 'se' } })

    await waitFor(() => {
      expect(setCommerceSearch).toHaveBeenCalledTimes(1)
    })
    expect(state().searchState).toEqual({ query: '', selectedLabel: '' })

    firstSearch.resolve()

    await waitFor(() => {
      expect(setCommerceSearch).toHaveBeenCalledTimes(2)
    })

    secondSearch.resolve()

    await waitFor(() => {
      expect(state().searchState).toEqual({ query: 'se', selectedLabel: '' })
    })
  })

  it('opens the Shoo profile dropdown and calls auth actions', async () => {
    const guest = createCommerceLakebedStub()
    render(<CommerceAccountButton lakebed={guest.lakebed} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(guest.signInWithGoogle).toHaveBeenCalledTimes(1)

    cleanup()

    const user = createCommerceLakebedStub({
      auth: {
        isAuthenticated: true,
        user: {
          displayName: 'Ada Lovelace',
          email: 'ada@example.com',
          isGuest: false,
        },
      },
    })

    render(<CommerceAccountButton lakebed={user.lakebed} />)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign out'))
    expect(user.signOut).toHaveBeenCalledTimes(1)
  })

  it('opens commerce hamburger navigation as a real sheet drawer', async () => {
    render(
      <CommerceMobileMenu
        brand="Lumiere"
        nav={['Bestsellers', 'Skincare']}
        homeTarget="Home"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Lumiere')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Skincare' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Skincare')
    })
  })
})
