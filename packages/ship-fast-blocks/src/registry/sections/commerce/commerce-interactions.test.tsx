// @vitest-environment jsdom

import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commerceCartItemKey, commerceCartLakebed } from './cart-lakebed.ts'
import type { CommerceLakebed } from './commerce-interactions.tsx'
import type {
  CommerceAdapter,
  CommerceRuntimeCart,
} from './commerce-contracts.ts'

const navigate = vi.fn()

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
    value: (callback: (time: number) => void) =>
      setTimeout(() => callback(Date.now()), 0),
    writable: true,
  })
}

if (typeof cancelAnimationFrame === 'undefined') {
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
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
const { CommerceProvider } = await import('./commerce-provider.tsx')

const renderDemoCommerce: (children: ReactNode) => ReturnType<typeof render> = (
  children,
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CommerceProvider
        fallbackProducts={[]}
        mode="demo"
        scope="sessions"
        tenant="commerce-interactions-test"
      >
        {children}
      </CommerceProvider>
    </QueryClientProvider>,
  )

const hostedCart: (id?: string) => CommerceRuntimeCart = (
  id = 'cart_live',
) => ({
  id,
  lines: [],
})

const hostedAdapter: (onAdd: CommerceAdapter['addItem']) => CommerceAdapter = (
  onAdd,
) => ({
  addItem: onAdd,
  addShippingMethod: vi.fn(async () => ({ cart: hostedCart() })),
  catalog: vi.fn(async () => ({
    products: [
      {
        collections: [],
        handle: 'serum',
        id: 'prod_live',
        images: [],
        options: [],
        sourceId: 'product:serum',
        tags: [],
        title: 'Hydrating Serum',
        variants: [
          {
            available: true,
            id: 'variant_live_serum',
            manageInventory: false,
            optionValues: {},
            prices: [{ amount: 28, currencyCode: 'usd' }],
            sourceId: 'variant:serum',
            title: 'Default',
          },
        ],
      },
    ],
  })),
  completeCart: vi.fn(async () => ({
    order: {
      id: 'order_live',
      lines: [],
      status: 'completed',
      store: { kind: 'sessions', sessionId: 'session-live' },
      subtotal: { amount: 0, currencyCode: 'usd' },
      total: { amount: 0, currencyCode: 'usd' },
    },
  })),
  createCart: vi.fn(async () => ({ cart: hostedCart() })),
  createPaymentSessions: vi.fn(async () => ({
    paymentAction: { type: 'none' },
    paymentSessions: [],
  })),
  getCart: vi.fn(async () => {
    throw new Error('No stored cart')
  }),
  getPaymentProviders: vi.fn(async () => ({ paymentProviders: [] })),
  getShippingOptions: vi.fn(async () => ({ shippingOptions: [] })),
  removeItem: vi.fn(async () => ({ cart: hostedCart() })),
  updateCart: vi.fn(async () => ({ cart: hostedCart() })),
  updateItem: vi.fn(async () => ({ cart: hostedCart() })),
})

const renderHostedCommerce: (
  children: ReactNode,
  adapter: CommerceAdapter,
) => ReturnType<typeof render> = (children, adapter) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[]}
        mode="hosted"
        scope="sessions"
        tenant="session-live"
      >
        {children}
      </CommerceProvider>
    </QueryClientProvider>,
  )

type TestCartItem = {
  createdAt: string
  id: string
  itemKey: string
  label: string
  price: string
  quantity: number
  updatedAt: string
}

type TestProduct = {
  createdAt: string
  id: string
  imageAlt: string
  itemKey: string
  label: string
  price: string
  subtitle: string
  updatedAt: string
}

type TestCommerceSearch = {
  createdAt: string
  id: string
  query: string
  selectedLabel: string
  updatedAt: string
}

type TestCartItemInput = {
  id: string
  itemKey?: string
  label: string
  price?: string
  quantity: number
}

type TestProductInput = {
  id?: string
  imageAlt?: string
  itemKey?: string
  label: string
  price?: string
  subtitle?: string
}

type TestCommerceSearchInput = Omit<
  TestCommerceSearch,
  'createdAt' | 'updatedAt'
>

type MutationArgs<TMutation> = TMutation extends (
  ctx: infer _TCtx,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: infer _TArgs
) => infer TResult
  ? Awaited<TResult>
  : never

const timestamp = '2026-06-26T00:00:00.000Z'

function testCartItem(item: TestCartItemInput): TestCartItem {
  return {
    createdAt: timestamp,
    id: item.id,
    itemKey: item.itemKey ?? '',
    label: item.label,
    price: item.price ?? '',
    quantity: item.quantity,
    updatedAt: timestamp,
  }
}

function testProduct(product: TestProductInput): TestProduct {
  return {
    createdAt: timestamp,
    id: product.id ?? '',
    imageAlt: product.imageAlt ?? '',
    itemKey: product.itemKey ?? '',
    label: product.label,
    price: product.price ?? '',
    subtitle: product.subtitle ?? '',
    updatedAt: timestamp,
  }
}

function testCommerceSearch(
  search: TestCommerceSearchInput,
): TestCommerceSearch {
  return {
    createdAt: timestamp,
    updatedAt: timestamp,
    ...search,
  }
}

function publicCartItem({
  id,
  itemKey,
  label,
  price,
  quantity,
}: TestCartItem): TestCartItemInput {
  return {
    id,
    itemKey,
    label,
    price,
    quantity,
  }
}

function publicProduct({
  id,
  imageAlt,
  itemKey,
  label,
  price,
  subtitle,
}: TestProduct): TestProductInput {
  return {
    id,
    imageAlt,
    itemKey,
    label,
    price,
    subtitle,
  }
}

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

function createCommerceLakebedStub({
  auth = {
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
  const searches: TestCommerceSearch[] = []
  const state = {
    items: items.map(testCartItem),
    products: products.map(testProduct),
    searches,
    searchState: {
      query: '',
      selectedLabel: '',
    },
  }
  const listeners = new Set<() => void>()
  const signInWithGoogle = vi.fn(async () => ({
    bundle: { challenge: '', state: '', verifier: '' },
    url: '',
  }))
  const signOut = vi.fn()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const getSnapshot = () => version
  const findItem = (input: Record<string, unknown>) =>
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

  const useQuery = createLakebedQueryStub<typeof commerceCartLakebed>({
    cartSummary: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return summary()
    },
    productCatalog: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return state.products
    },
    commerceSearchState: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return {
        query: state.searchState.query,
        searches: state.searches,
        selectedLabel: state.searchState.selectedLabel,
      }
    },
  })

  const useMutation = createLakebedMutationStub<typeof commerceCartLakebed>({
    syncCatalog: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.syncCatalog
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.syncCatalog?.()
              state.products = (
                input.products as Record<string, unknown>[]
              ).map((product: Record<string, unknown>, index: number) =>
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
          [notify, state],
        ),
      })
    },
    clearCart: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
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
            await mutationDelay?.clearCart?.()
            state.items = []
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, [notify, state]),
      })
    },
    setCommerceSearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.setCommerceSearch
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.setCommerceSearch?.()
              const next = {
                query: String(String(input.query ?? '')).trim(),
                selectedLabel: String(String(input.selectedLabel ?? '')).trim(),
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
          [notify, state],
        ),
      })
    },
    addItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.addItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.addItem?.()
              const existing = findItem(input)
              const label = String(input.label)?.trim() || 'Item'
              const itemKey = commerceCartItemKey({
                itemKey: String(input.itemKey ?? ''),
                label,
                price: String(input.price ?? ''),
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
                    price: String(input.price ?? ''),
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
          [findItem, notify, state],
        ),
      })
    },
    incrementItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.incrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.incrementItem?.()
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
          [findItem, notify, state],
        ),
      })
    },
    decrementItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.decrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.decrementItem?.()
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
          [findItem, notify, state],
        ),
      })
    },
    removeItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.removeItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.removeItem?.()
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
          [findItem, notify, state],
        ),
      })
    },
    deleteItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.deleteItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(
          async (input: Record<string, unknown>) => {
            setPendingCount((count) => count + 1)
            setLastError(null)
            try {
              await mutationDelay?.deleteItem?.()
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
          [notify, state],
        ),
      })
    },
  })

  const lakebed: CommerceLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => auth,
    useData: () => null,
    useQuery,
    useMutation,
  }

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
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const getSnapshot = () => version

  const useQuery = createLakebedQueryStub<typeof commerceCartLakebed>({
    cartSummary: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return {
        count: state.items.reduce((total, item) => total + item.quantity, 0),
        items: state.items,
      }
    },
    productCatalog: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return state.products
    },
    commerceSearchState: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return null
    },
  })

  const useMutation = createLakebedMutationStub<typeof commerceCartLakebed>({
    clearCart: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.clearCart
      >({
        lastError,
        pendingCount: pendingByName.clearCart ?? 0,
        reset,
        runMutation: useCallback(async () => {
          pendingByName.clearCart = (pendingByName.clearCart ?? 0) + 1
          notify()
          try {
            await mutationDelay?.clearCart?.()
            state = { ...state, items: [] }
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            pendingByName.clearCart = Math.max(
              0,
              (pendingByName.clearCart ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    addItem: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.addItem
      >({
        lastError,
        pendingCount: pendingByName.addItem ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.addItem = (pendingByName.addItem ?? 0) + 1
          notify()
          try {
            await mutationDelay?.addItem?.()
            const label = String(input.label)?.trim() || 'Item'
            const itemKey = commerceCartItemKey({
              itemKey: String(input.itemKey ?? ''),
              label,
              price: String(input.price ?? ''),
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
                    price: String(input.price ?? ''),
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
            pendingByName.addItem = Math.max(
              0,
              (pendingByName.addItem ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    incrementItem: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.incrementItem
      >({
        lastError,
        pendingCount: pendingByName.incrementItem ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.incrementItem = (pendingByName.incrementItem ?? 0) + 1
          notify()
          try {
            await mutationDelay?.incrementItem?.()
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
            pendingByName.incrementItem = Math.max(
              0,
              (pendingByName.incrementItem ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    decrementItem: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.decrementItem
      >({
        lastError,
        pendingCount: pendingByName.decrementItem ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.decrementItem = (pendingByName.decrementItem ?? 0) + 1
          notify()
          try {
            await mutationDelay?.decrementItem?.()
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
            pendingByName.decrementItem = Math.max(
              0,
              (pendingByName.decrementItem ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    removeItem: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.removeItem
      >({
        lastError,
        pendingCount: pendingByName.removeItem ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.removeItem = (pendingByName.removeItem ?? 0) + 1
          notify()
          try {
            await mutationDelay?.removeItem?.()
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
            pendingByName.removeItem = Math.max(
              0,
              (pendingByName.removeItem ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    deleteItem: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.deleteItem
      >({
        lastError,
        pendingCount: pendingByName.deleteItem ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.deleteItem = (pendingByName.deleteItem ?? 0) + 1
          notify()
          try {
            await mutationDelay?.deleteItem?.()
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
            pendingByName.deleteItem = Math.max(
              0,
              (pendingByName.deleteItem ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    syncCatalog: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.syncCatalog
      >({
        lastError,
        pendingCount: pendingByName.syncCatalog ?? 0,
        reset,
        runMutation: useCallback(async (input: Record<string, unknown>) => {
          pendingByName.syncCatalog = (pendingByName.syncCatalog ?? 0) + 1
          notify()
          try {
            await mutationDelay?.syncCatalog?.()
            state = {
              ...state,
              products: (input.products as Record<string, unknown>[]).map(
                (product: Record<string, unknown>, index: number) =>
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
            pendingByName.syncCatalog = Math.max(
              0,
              (pendingByName.syncCatalog ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
    setCommerceSearch: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      return useTestLakebedMutation<
        typeof commerceCartLakebed.mutations.setCommerceSearch
      >({
        lastError,
        pendingCount: pendingByName.setCommerceSearch ?? 0,
        reset,
        runMutation: useCallback(async () => {
          pendingByName.setCommerceSearch =
            (pendingByName.setCommerceSearch ?? 0) + 1
          notify()
          try {
            await mutationDelay?.setCommerceSearch?.()
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            pendingByName.setCommerceSearch = Math.max(
              0,
              (pendingByName.setCommerceSearch ?? 0) - 1,
            )
            notify()
          }
        }, []),
      })
    },
  })

  const lakebed: CommerceLakebed = {
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
    useData: () => null,
    useQuery,
    useMutation,
  }

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
    const { lakebed: baseLakebed } = createCommerceLakebedStub()
    const useQueryWithoutItems: CommerceLakebed['useQuery'] = (name) =>
      name === 'cartSummary' ? { count: 3 } : baseLakebed.useQuery(name)
    const lakebed = {
      ...baseLakebed,
      useMutation: () => noopMutation,
      useQuery: useQueryWithoutItems,
    } satisfies CommerceLakebed

    render(<CommerceCartButton lakebed={lakebed} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('You have 3 items in your cart.')).toBeTruthy()
    expect(
      screen.getByText('Add a product to see it here instantly.'),
    ).toBeTruthy()
    expect(
      screen
        .getByRole('button', { name: 'Clear cart' })
        .hasAttribute('disabled'),
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

  it('adds hosted catalog products through the live commerce controller by stable source ID', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    const addItem = vi.fn<CommerceAdapter['addItem']>(
      async (input, cartId) => ({
        cart: {
          ...hostedCart(cartId),
          lines: [{ id: `line:${input.variantId}` }],
        },
      }),
    )
    const adapter = hostedAdapter(addItem)

    renderHostedCommerce(
      <CommerceAddItemButton
        lakebed={lakebed}
        item={{
          itemKey: 'product:serum',
          label: 'Hydrating Serum',
          price: '$28',
        }}
        pendingChildren={
          <>
            <CommerceMutationSpinner />
            Adding hosted serum
          </>
        }
      >
        Add hosted serum
      </CommerceAddItemButton>,
      adapter,
    )

    const button = await screen.findByRole('button', {
      name: 'Add hosted serum',
    })
    await waitFor(() => {
      expect(button.hasAttribute('disabled')).toBe(false)
    })

    fireEvent.click(button)

    await waitFor(() => {
      expect(addItem).toHaveBeenCalledWith(
        { quantity: 1, variantId: 'variant_live_serum' },
        'cart_live',
      )
      expect(state().items).toHaveLength(0)
    })
  })

  it('scopes add-to-cart loading state to the clicked product button', async () => {
    const add = createDeferred()
    const { lakebed } = createCommerceLakebedStub({
      mutationDelay: {
        addItem: () => add.promise,
      },
    })

    renderDemoCommerce(
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

    renderDemoCommerce(
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

    renderDemoCommerce(
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

  it('opens product search when the Lakebed catalog query returns DB-shaped records with malformed rows', async () => {
    const { lakebed } = createCommerceLakebedStub()
    const malformedUseQuery: CommerceLakebed['useQuery'] = (name) => {
      if (name === 'productCatalog') {
        return {
          missing: null,
          product_1: {
            id: 123,
            label: null,
            price: false,
          },
          product_2: {
            id: 'product_2',
            label: 'Truffle Box',
            price: '$12.50',
            subtitle: 'Gift set',
          },
        }
      }
      return lakebed.useQuery(name)
    }
    const malformedCatalogLakebed = {
      ...lakebed,
      useQuery: malformedUseQuery,
    } satisfies CommerceLakebed

    expect(() =>
      render(<CommerceSearchButton lakebed={malformedCatalogLakebed} />),
    ).not.toThrow()

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Truffle Box')).toBeTruthy()
    expect(screen.getByText('Gift set · $12.50')).toBeTruthy()
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

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(guest.signInWithGoogle).toHaveBeenCalledTimes(1)

    cleanup()

    const user = createCommerceLakebedStub({
      auth: {
        isAuthenticated: true,
        isGuest: false,
        provider: 'google',
        userId: 'google:ada',
        displayName: 'Ada Lovelace',
        user: {
          displayName: 'Ada Lovelace',
          email: 'ada@example.com',
          id: 'google:ada',
          isGuest: false,
          provider: 'google',
          userId: 'google:ada',
        },
      },
    })

    render(<CommerceAccountButton lakebed={user.lakebed} />)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign out'))
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
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

    const drawer = screen.getByRole('dialog')
    const skincareLink = within(drawer).getByRole('link', {
      name: 'Skincare',
    })
    expect(skincareLink.getAttribute('href')).toBe('#skincare')
    fireEvent.click(skincareLink)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('ignores generated null and empty mobile nav entries', () => {
    const generatedNav = ['Home', null, '  ', 'Skincare'] as unknown as string[]
    const generatedHomeTarget = null as unknown as string

    expect(() =>
      render(
        <CommerceMobileMenu
          brand="Lumiere"
          nav={generatedNav}
          homeTarget={generatedHomeTarget}
        />,
      ),
    ).not.toThrow()

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Skincare')).toBeTruthy()
  })
})
