// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { LakebedMutationFunction } from '@ship-fast/lakebed/react'
import { guestAuthContext } from '@ship-fast/lakebed/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import type { CommerceLakebed } from '../commerce/commerce-interactions.tsx'

type TestCartItem = {
  createdAt: string
  id: string
  label: string
  price: string
  quantity: number
  updatedAt: string
}

type TestProduct = {
  createdAt: string
  id: string
  imageAlt: string
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
        throw new Error('Missing jewelry commerce Lakebed client')
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
const { JewelryStoreHero } = await import('./JewelryStoreHero.tsx')
const { JewelryStoreNavbar } = await import('./JewelryStoreNavbar.tsx')
const { JewelryStorePieces } = await import('./JewelryStorePieces.tsx')

const publicCartItem = ({ id, label, price, quantity }: TestCartItem) => ({
  id,
  label,
  price,
  quantity,
})

const publicProduct = ({
  imageAlt,
  label,
  price,
  subtitle,
}: TestProduct): TestProductInput => ({ imageAlt, label, price, subtitle })

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
  const findItem = (input: TestCartInput) =>
    (input.id ? state.items.find((item) => item.id === input.id) : undefined) ??
    (input.label
      ? state.items.find((item) => item.label === input.label)
      : undefined)
  const replaceItem = (
    target: TestCartItem,
    updater: (item: TestCartItem) => TestCartItem,
  ) => {
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === target.id ? updater(item) : item,
      ),
    }
  }
  const addItem = (input: TestCartInput) => {
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
          label,
          price: input.price ?? '',
          quantity: 1,
          updatedAt: timestamp,
        },
      ],
    }
  }
  const syncCatalog = (products: TestProductInput[]) => {
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

  const lakebed = {
    signInWithGoogle,
    signOut,
    useAuth: () => guestAuthContext,
    useData: () => state,
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

      if (name === 'cartSummary') return cartSummary()
      if (name === 'productCatalog') return state.products
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => setLastError(null), [])

      if (name === 'syncCatalog') {
        return useTestMutation<
          typeof commerceCartLakebed.mutations.syncCatalog
        >({
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
      }

      if (name === 'incrementItem') {
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
      }

      if (name === 'decrementItem' || name === 'removeItem') {
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
      }

      if (name === 'deleteItem') {
        return useTestMutation<typeof commerceCartLakebed.mutations.deleteItem>(
          {
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
          },
        )
      }

      if (name === 'clearCart') {
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
      }

      if (name === 'setCommerceSearch') {
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
      }

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
  } satisfies CommerceLakebed

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

describe('JewelryStore fullstack commerce behavior', () => {
  it('binds hero and piece data to search, Shoo account, and the cart drawer without navigation-data collisions', async () => {
    const { lakebed, signInWithGoogle, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <>
        <JewelryStoreNavbar.component
          props={{
            brand: 'Maison Test',
            cartCount: '0',
            nav: ['Collections', 'Pieces'],
          }}
          lakebed={lakebed}
        />
        <JewelryStoreHero.component
          props={{
            featuredLabel: 'Featured Piece',
            featuredName: 'Celeste Pendant',
            featuredPrice: '$8,400',
            imageAlt: 'Diamond pendant on black velvet',
            primaryCta: 'Explore Collections',
          }}
          lakebed={lakebed}
        />
        <JewelryStorePieces.component
          props={{
            addToCartLabel: 'Reserve piece',
            items: [
              {
                imageAlt: 'Sapphire ring on silk',
                price: '$3,200',
                spec: '18K Yellow Gold, 0.5ct',
                title: 'Sapphire Halo Ring',
              },
            ],
          }}
          lakebed={lakebed}
        />
      </>,
    )

    await waitFor(() => {
      expect(state().products.map((product) => product.label)).toEqual(
        expect.arrayContaining(['Celeste Pendant', 'Sapphire Halo Ring']),
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const searchDialog = await screen.findByRole('dialog')
    expect(within(searchDialog).getByText('Celeste Pendant')).toBeTruthy()
    expect(within(searchDialog).getByText('Sapphire Halo Ring')).toBeTruthy()
    fireEvent.click(within(searchDialog).getByText('Celeste Pendant'))
    expect(navigate).not.toHaveBeenCalledWith('Celeste Pendant')

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Account' }))
    fireEvent.click(await screen.findByText('Sign in with Shoo'))
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Celeste Pendant to cart' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reserve piece' }))

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Celeste Pendant',
          price: '$8,400',
          quantity: 1,
        },
        {
          id: 'item-2',
          label: 'Sapphire Halo Ring',
          price: '$3,200',
          quantity: 1,
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cart' }))
    const cartDialog = screen.getByRole('dialog')
    expect(within(cartDialog).getByText('Your cart')).toBeTruthy()
    expect(within(cartDialog).getByText('Celeste Pendant')).toBeTruthy()
    expect(within(cartDialog).getByText('Sapphire Halo Ring')).toBeTruthy()
    expect(navigate).not.toHaveBeenCalledWith('Cart')
    expect(navigate).not.toHaveBeenCalledWith('Reserve piece')
  })

  it('keeps collection CTAs as navigation while featured-piece actions mutate cart data', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed

    render(
      <JewelryStoreHero.component
        props={{
          featuredName: 'Archive Diamond Bracelet',
          featuredPrice: '$12,500',
          primaryCta: 'Explore Collections',
          secondaryCta: 'Private Viewing',
        }}
        lakebed={lakebed}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Explore Collections' }))
    fireEvent.click(screen.getByRole('button', { name: 'Private Viewing' }))

    expect(navigate).toHaveBeenCalledWith('Explore Collections')
    expect(navigate).toHaveBeenCalledWith('Private Viewing')
    expect(state().items).toEqual([])

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Archive Diamond Bracelet to cart',
      }),
    )

    await waitFor(() => {
      expect(state().items).toEqual([
        {
          id: 'item-1',
          label: 'Archive Diamond Bracelet',
          price: '$12,500',
          quantity: 1,
        },
      ])
    })
  })
})
