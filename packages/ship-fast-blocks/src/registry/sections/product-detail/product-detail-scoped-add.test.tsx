// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
} from '@ship-fast/lakebed/test-helpers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import type { CommerceLakebed } from '../commerce/commerce-interactions.tsx'
import { ProductDetailCta } from './ProductDetailCta.tsx'
import { ProductDetailHero } from './ProductDetailHero.tsx'
import { ProductDetailNavbar } from './ProductDetailNavbar.tsx'

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

type TestState = {
  items: TestCartItem[]
  products: TestProduct[]
}

type PublicCartItem = Omit<TestCartItem, 'createdAt' | 'updatedAt'>
type PublicProduct = Omit<TestProduct, 'createdAt' | 'updatedAt'>

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
        throw new Error('Missing commerce Lakebed client')
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

function createDeferred() {
  let complete = () => {}
  const promise = new Promise<void>((resolve) => {
    complete = resolve
  })

  return { complete, promise }
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

const timestamp = '2026-06-26T00:00:00.000Z'

function createCommerceLakebedStub() {
  let version = 0
  const deferred = createDeferred()
  let state: TestState = {
    items: [],
    products: [],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const getSnapshot = () => version
  const cartSummary = () => ({
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    items: state.items,
  })
  const syncCatalogProducts = (products) => {
    state = {
      ...state,
      products: products.map((product, index) => ({
        createdAt: timestamp,
        id: `product-${index + 1}`,
        imageAlt: product.imageAlt ?? '',
        itemKey: '',
        label: product.label,
        price: product.price ?? '',
        subtitle: product.subtitle ?? '',
        updatedAt: timestamp,
      })),
    }
  }
  const addItem = async (input) => {
    await deferred.promise
    const label = input.label.trim() || 'Item'
    const price = input.price ?? ''
    const itemKey = input.itemKey?.trim() || `${label}\u0000${price}`
    const existing = state.items.find((item) => item.itemKey === itemKey)

    state = {
      ...state,
      items: existing
        ? state.items.map((item) =>
            item.itemKey === itemKey
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...state.items,
            {
              createdAt: timestamp,
              id: `item-${state.items.length + 1}`,
              itemKey,
              label,
              price,
              quantity: 1,
              updatedAt: timestamp,
            },
          ],
    }
  }

  const useQuery = createLakebedQueryStub<typeof commerceCartLakebed>({
    cartSummary: () => {
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return cartSummary()
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
            syncCatalogProducts(input.products)
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
            await addItem(input)
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
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.clearCart>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
    incrementItem: () => {
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.incrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
    decrementItem: () => {
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.decrementItem
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
    deleteItem: () => {
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.deleteItem>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
    removeItem: () => {
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<typeof commerceCartLakebed.mutations.removeItem>({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
    setCommerceSearch: () => {
      const [pendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])
      return useTestMutation<
        typeof commerceCartLakebed.mutations.setCommerceSearch
      >({
        lastError,
        pendingCount,
        reset,
        runMutation: useCallback(async () => [], []),
      })
    },
  })

  const lakebed: CommerceLakebed = {
    signInWithGoogle: async () => ({
      bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
      url: 'https://shoo.dev/auth',
    }),
    signOut: () => {},
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

  const publicCartItem = ({
    createdAt: _ca,
    updatedAt: _ua,
    ...item
  }): PublicCartItem => item
  const publicProduct = ({
    createdAt: _ca,
    updatedAt: _ua,
    ...product
  }): PublicProduct => product

  return {
    completeAddItem: deferred.complete,
    lakebed,
    state: () => ({
      items: state.items.map(publicCartItem),
      products: state.products.map(publicProduct),
    }),
  }
}

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('product detail add-to-cart loading state', () => {
  it('shows loading only on the clicked add button while the shared cart mutation is pending', async () => {
    const { completeAddItem, lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <ProductDetailCta.component
          props={{
            actions: [
              { label: 'Add to Cart', variant: 'primary' },
              { label: 'Learn More', target: 'Features', variant: 'outline' },
            ],
            productPrice: '$299',
            productTitle: 'Aurora Pro Headphones',
          }}
        />
        <ProductDetailHero.component
          props={{
            description: 'Portable studio monitoring with low-latency audio.',
            imageAlt: 'Aurora Pro studio headphones product image',
            price: '$299',
            primaryCta: 'Add to Cart',
            title: 'Aurora Pro Headphones',
          }}
        />
        <ProductDetailNavbar.component
          props={{
            nav: ['Overview', 'Features'],
            productPrice: '$299',
            productTitle: 'Aurora Pro Headphones',
          }}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toHaveLength(1)
    })

    const addButtons = screen.getAllByRole('button', { name: 'Add to Cart' })
    expect(addButtons).toHaveLength(3)

    fireEvent.click(addButtons[1])

    await waitFor(() => {
      expect(addButtons[1].getAttribute('aria-busy')).toBe('true')
    })
    expect(addButtons[1].textContent).toContain('Adding')
    expect(addButtons[0].getAttribute('aria-busy')).toBe('false')
    expect(addButtons[0].textContent).toContain('Add to Cart')
    expect(addButtons[2].getAttribute('aria-busy')).toBe('false')
    expect(addButtons[2].textContent).toContain('Add to Cart')
    expect((addButtons[0] as HTMLButtonElement).disabled).toBe(false)
    expect((addButtons[2] as HTMLButtonElement).disabled).toBe(false)

    completeAddItem()

    await waitFor(() => {
      expect(addButtons[1].getAttribute('aria-busy')).toBe('false')
      expect(state().items).toEqual([
        {
          id: 'item-1',
          itemKey: 'Aurora Pro Headphones\u0000$299\u0000Midnight Black',
          label: 'Aurora Pro Headphones - Midnight Black',
          price: '$299',
          quantity: 1,
        },
      ])
    })
    expect(navigate).not.toHaveBeenCalledWith('Add to Cart')
  })

  it('treats purchase labels beyond Add to Cart as cart mutations', async () => {
    const { completeAddItem, lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <ProductDetailCta.component
          props={{
            actions: [
              { label: 'Add to bag', variant: 'primary' },
              { label: 'Learn More', target: 'Features', variant: 'outline' },
            ],
            productPrice: '$199',
            productTitle: 'Aurora Mini',
          }}
        />
        <ProductDetailNavbar.component
          props={{
            cta: { label: 'Pre-order', variant: 'primary' },
            nav: ['Overview', 'Features'],
            productPrice: '$199',
            productTitle: 'Aurora Mini',
          }}
        />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }))
    completeAddItem()

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          itemKey: 'Aurora Mini\u0000$199',
          label: 'Aurora Mini',
          price: '$199',
          quantity: 1,
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pre-order' }))

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          itemKey: 'Aurora Mini\u0000$199',
          label: 'Aurora Mini',
          price: '$199',
          quantity: 2,
        },
      ])
    })
    expect(navigate).not.toHaveBeenCalledWith('Add to bag')
    expect(navigate).not.toHaveBeenCalledWith('Pre-order')
  })

  it('adds the selected product detail variant as a distinct cart line', async () => {
    const { completeAddItem, lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <ProductDetailHero.component
        props={{
          price: '$299',
          primaryCta: 'Add to Cart',
          title: 'Aurora Pro Headphones',
          variants: ['Midnight Black', 'Arctic Silver'],
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Arctic Silver' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
    completeAddItem()

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          itemKey: 'Aurora Pro Headphones\u0000$299\u0000Arctic Silver',
          label: 'Aurora Pro Headphones - Arctic Silver',
          price: '$299',
          quantity: 1,
        },
      ])
    })
    expect(navigate).not.toHaveBeenCalledWith('Add to Cart')
  })

  it('routes non-purchase primary labels instead of mutating the cart', () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <ProductDetailHero.component
        props={{
          price: '$299',
          primaryCta: 'View details',
          secondaryCta: 'Compare specs',
          title: 'Aurora Pro Headphones',
        }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'View details' }))

    expect(navigate).toHaveBeenCalledWith('View details')
    expect(state().items).toEqual([])
  })
})
