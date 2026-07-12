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

type TestCartInput = {
  id?: string
  label?: string
  price?: string
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
        throw new Error('Missing furniture commerce Lakebed client')
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

const { cleanup, fireEvent, render, screen, waitFor, within } =
  await import('@testing-library/react')
const { FurnitureStoreHero } = await import('./FurnitureStoreHero.tsx')
const { FurnitureStoreNavbar } = await import('./FurnitureStoreNavbar.tsx')
const { FurnitureStoreProducts } = await import('./FurnitureStoreProducts.tsx')

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
      Object.assign((...args) => runMutation(...args), {
        isPending: false,
        lastError: emptyLastError,
        pendingCount: 0,
        reset,
      }),
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
  const findItem = (input) =>
    (input.id ? state.items.find((item) => item.id === input.id) : undefined) ??
    (input.label
      ? state.items.find((item) => item.label === input.label)
      : undefined)
  const replaceItem = (target, updater) => {
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === target.id ? updater(item) : item,
      ),
    }
  }
  const addItem = (input) => {
    const label = input.label?.trim() || 'Item'
    const existing = state.items.find((item) => item.label === label)

    if (existing) {
      replaceItem(existing, (item) => ({
        ...item,
        price: item.price || input.price || '',
        quantity: item.quantity + 1,
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
          price: input.price ?? '',
          quantity: 1,
          updatedAt: timestamp,
        },
      ],
    }
  }
  const syncCatalog = (products) => {
    const nextProducts = [...state.products]

    products.forEach((product) => {
      const label = product.label.trim()
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
      return null
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
              replaceItem(item, (current) => ({
                ...current,
                quantity: current.quantity + 1,
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
              replaceItem(item, (current) => ({
                ...current,
                quantity: current.quantity - 1,
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
              replaceItem(item, (current) => ({
                ...current,
                quantity: current.quantity - 1,
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
        runMutation: useCallback(async () => {
          setPendingCount((count) => count + 1)
          setLastError(null)
          try {
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
    }),
  }
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
  document.body.removeAttribute('style')
})

describe('FurnitureStore fullstack commerce behavior', () => {
  it('shares hero and product catalog with search, Shoo account, and shopping cart drawer state', async () => {
    const { lakebed, signInWithGoogle, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <FurnitureStoreNavbar.component
          props={{
            brand: 'Haven Test',
            cartCount: '0',
            nav: ['Room Inspiration', 'Furniture'],
          }}
        />
        <FurnitureStoreHero.component
          props={{
            featuredLabel: 'Featured: The Cloud Sofa',
            featuredName: 'Cloud Linen Sofa',
            featuredPrice: '$2,849',
            imageAlt: 'Cloud linen sofa in a bright living room',
            primaryCta: 'Explore Rooms',
            secondaryCta: 'New Arrivals',
          }}
        />
        <FurnitureStoreProducts.component
          props={{
            items: [
              {
                name: 'Oak Dining Table',
                price: '$1,899',
                variant: 'Natural Oak / 72"',
              },
            ],
          }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products.map((product) => product.label)).toEqual(
        expect.arrayContaining(['Cloud Linen Sofa', 'Oak Dining Table']),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Cloud Linen Sofa')).toBeTruthy()
    expect(within(searchDialog).getByText('Oak Dining Table')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Oak Dining Table'))
    expect(navigate).not.toHaveBeenCalledWith('Oak Dining Table')

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Cloud Linen Sofa to cart' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Oak Dining Table to cart' }),
    )

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Cloud Linen Sofa',
          price: '$2,849',
          quantity: 1,
        },
        {
          id: 'item-2',
          label: 'Oak Dining Table',
          price: '$1,899',
          quantity: 1,
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Shopping cart' }))
    const cartDialog = screen.getByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Cloud Linen Sofa')).toBeTruthy()
    expect(within(cartDialog).getByText('Oak Dining Table')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalledWith('Cart')
  })

  it('keeps room CTAs as navigation and uses the hero featured button for cart mutations', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <FurnitureStoreHero.component
        props={{
          featuredName: 'Walnut Lounge Chair',
          featuredPrice: '$749',
          primaryCta: 'Explore Rooms',
          secondaryCta: 'New Arrivals',
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Explore Rooms' }))
    fireEvent.click(screen.getByRole('button', { name: 'New Arrivals' }))

    expect(navigate).toHaveBeenCalledWith('Explore Rooms')
    expect(navigate).toHaveBeenCalledWith('New Arrivals')
    expect(state().items).toEqual([])

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Walnut Lounge Chair to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Walnut Lounge Chair',
          price: '$749',
          quantity: 1,
        },
      ])
    })
  })
})
