// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { guestAuthContext } from '@ship-fast/lakebed/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import type { CommerceLakebed } from '../commerce/commerce-interactions.tsx'

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

type TestProductInput = {
  imageAlt?: string
  label: string
  price?: string
  subtitle?: string
}

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
const navigate = vi.fn()
const lakebedRef: { current: CommerceLakebed | null } = { current: null }

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')

  return {
    ...actual,
    createLakebedClient: vi.fn(() => {
      if (!lakebedRef.current) {
        throw new Error('Missing fashion commerce Lakebed client')
      }
      return lakebedRef.current
    }),
  }
})

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

const { cleanup, fireEvent, render, screen, waitFor, within } = await import(
  '@testing-library/react'
)
const { FashionStoreHero } = await import('./FashionStoreHero.tsx')
const { FashionStoreNavbar } = await import('./FashionStoreNavbar.tsx')
const { FashionStoreProducts } = await import('./FashionStoreProducts.tsx')

function publicCartItem({ id, label, price, quantity }: TestCartItem) {
  return {
    id,
    label,
    price,
    quantity,
  }
}

function publicProduct({
  imageAlt,
  label,
  price,
  subtitle,
}: TestProduct): TestProductInput {
  return { imageAlt, label, price, subtitle }
}

function useTestMutation<TMutation>({
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
        (...args: [string, Record<string, unknown>]) => runMutation(...args),
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

function createCommerceLakebedStub() {
  let version = 0
  const initialItems: TestCartItem[] = []
  const initialProducts: TestProduct[] = []
  let state = {
    items: initialItems,
    products: initialProducts,
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
  const cartSummary = () => ({
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    items: state.items,
  })
  const findItem = (input: Record<string, unknown>) =>
    (input.id ? state.items.find((item) => item.id === input.id) : undefined) ??
    (input.label
      ? state.items.find((item) => item.label === input.label)
      : undefined)
  const replaceItem = (
    target: Record<string, unknown>,
    updater: (item: TestCartItem) => TestCartItem,
  ) => {
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === target.id ? updater(item) : item,
      ),
    }
  }
  const addItem = (input: Record<string, unknown>) => {
    const label = String(input.label)?.trim() || 'Item'
    const existing = state.items.find((item) => item.label === label)

    if (existing) {
      replaceItem(existing, (item: TestCartItem) => ({
        ...item,
        price: item.price || String(input.price || ''),
        quantity: Number(String(item.quantity)) + 1,
        updatedAt: timestamp,
      }))
      return
    }

    state = {
      ...state,
      items: [
        ...state.items,
        {
          createdAt: timestamp,
          id: `item-${state.items.length + 1}`,
          itemKey: '',
          label,
          price: String(input.price ?? ''),
          quantity: 1,
          updatedAt: timestamp,
        },
      ],
    }
  }
  const syncCatalog = (products: Record<string, unknown>[]) => {
    const nextProducts = [...state.products]

    products.forEach((product) => {
      const label = String(product.label).trim()
      if (!label) return

      const existingIndex = nextProducts.findIndex(
        (item) => item.label === label,
      )
      const nextProduct = {
        createdAt: timestamp,
        id:
          existingIndex >= 0
            ? nextProducts[existingIndex].id
            : `product-${nextProducts.length + 1}`,
        imageAlt: product.imageAlt ?? '',
        itemKey: '',
        label,
        price: product.price ?? '',
        subtitle: product.subtitle ?? '',
        updatedAt: timestamp,
      }

      if (existingIndex >= 0) {
        nextProducts[existingIndex] = nextProduct
      } else {
        nextProducts.push(nextProduct)
      }
    })

    state = {
      ...state,
      products: nextProducts,
    }
  }

  const useQuery = createLakebedQueryStub<typeof commerceCartLakebed>({
    cartSummary: () => {
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
      return cartSummary()
    },
    productCatalog: () => {
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
      return state.products
    },
    commerceSearchState: () => {
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
      return {
        query: state.searchState.query,
        searches: [],
        selectedLabel: state.searchState.selectedLabel,
      }
    },
  })

  const useMutation = createLakebedMutationStub<typeof commerceCartLakebed>({
    syncCatalog: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.syncCatalog>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            syncCatalog(input.products)
            notify()
            return state.products
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    incrementItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.incrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const item = findItem(input)
            if (item) {
              replaceItem(item, (current: TestCartItem) => ({
                ...current,
                quantity: Number(String(current.quantity)) + 1,
                updatedAt: timestamp,
              }))
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    decrementItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.decrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const item = findItem(input)
            if (item && item.quantity > 1) {
              replaceItem(item, (current: TestCartItem) => ({
                ...current,
                quantity: Number(String(current.quantity)) - 1,
                updatedAt: timestamp,
              }))
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    removeItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.removeItem>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const item = findItem(input)
            if (item && item.quantity > 1) {
              replaceItem(item, (current: TestCartItem) => ({
                ...current,
                quantity: Number(String(current.quantity)) - 1,
                updatedAt: timestamp,
              }))
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    deleteItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.deleteItem>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            const item = findItem(input)
            state = {
              ...state,
              items: item
                ? state.items.filter((current) => current.id !== item.id)
                : state.items,
            }
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    clearCart: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.clearCart>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            state = { ...state, items: [] }
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    setCommerceSearch: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.setCommerceSearch
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            state = {
              ...state,
              searchState: {
                query: String(String(input.query ?? '')).trim(),
                selectedLabel: String(String(input.selectedLabel ?? '')).trim(),
              },
            }
            notify()
            return []
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
    addItem: () => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.addItem>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
            addItem(input)
            notify()
            return state.items
          } catch (error) {
            setLastError(error)
            throw error
          } finally {
            setPendingCount((count) => Math.max(0, count - 1))
          }
        }, []),
      })
    },
  })

  const lakebed: CommerceLakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => guestAuthContext,
    useData: () => state,
    useQuery,
    useMutation,
  }

  return {
    lakebed,
    signInWithGoogle,
    state: () => ({
      items: state.items.map(publicCartItem),
      products: state.products.map(publicProduct),
      searchState: state.searchState,
    }),
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('FashionStore fullstack commerce behavior', () => {
  it('shares hero and product catalog with search, Shoo account, and shopping bag drawer state', async () => {
    const { lakebed, signInWithGoogle, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <FashionStoreNavbar.component
          props={{ bagCount: '0', nav: ['Collections', 'Lookbook'] }}
        />
        <FashionStoreHero.component
          props={{
            featuredName: 'Archive Linen Capsule',
            featuredPrice: '$485',
            featuredVariant: 'Cream · XS-XL',
            imageAlt: 'Cream linen capsule wardrobe editorial',
            primaryCta: 'Shop the Collection',
            secondaryCta: 'View Lookbook',
          }}
        />
        <FashionStoreProducts.component
          props={{
            items: [
              {
                imageAlt: 'Black wool coat on model',
                name: 'Black Wool Coat',
                price: '$420',
                variant: 'Black · S-L',
              },
            ],
            quickAdd: 'Quick Add',
          }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products.map((product) => product.label)).toEqual(
        expect.arrayContaining(['Archive Linen Capsule', 'Black Wool Coat']),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Archive Linen Capsule')).toBeTruthy()
    expect(within(searchDialog).getByText('Black Wool Coat')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Black Wool Coat'))

    await waitFor(() => {
      expect(state().searchState).toEqual({
        query: 'Black Wool Coat',
        selectedLabel: 'Black Wool Coat',
      })
    })
    expect(navigate).not.toHaveBeenCalledWith('Black Wool Coat')

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Archive Linen Capsule to cart',
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quick Add' }))

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Archive Linen Capsule',
          price: '$485',
          quantity: 1,
        },
        {
          id: 'item-2',
          label: 'Black Wool Coat',
          price: '$420',
          quantity: 1,
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Shopping bag' }))
    const cartDialog = screen.getByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Archive Linen Capsule')).toBeTruthy()
    expect(within(cartDialog).getByText('Black Wool Coat')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalledWith('Cart')
  })

  it('keeps editorial CTAs as navigation and uses the hero capsule button for cart mutations', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <FashionStoreHero.component
        props={{
          featuredName: 'Tailored Travel Capsule',
          featuredPrice: '$520',
          primaryCta: 'Shop the Collection',
          secondaryCta: 'View Lookbook',
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Shop the Collection' }))
    fireEvent.click(screen.getByRole('button', { name: 'View Lookbook' }))

    expect(navigate).toHaveBeenCalledWith('Shop the Collection')
    expect(navigate).toHaveBeenCalledWith('View Lookbook')
    expect(state().items).toEqual([])

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Tailored Travel Capsule to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Tailored Travel Capsule',
          price: '$520',
          quantity: 1,
        },
      ])
    })
  })
})
