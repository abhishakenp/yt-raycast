// @vitest-environment jsdom

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TestCartItem = {
  id: string
  label: string
  price?: string
  quantity: number
}

type TestProduct = {
  imageAlt?: string
  label: string
  price?: string
  subtitle?: string
}

type TestLakebed = {
  useAuth: () => {
    isAuthenticated: boolean
    user: { displayName: string; email: string; isGuest: boolean }
  }
  useMutation: (name: string) => {
    (input?: any): Promise<unknown>
    isPending: boolean
    lastError: unknown | null
    pendingCount: number
    reset: () => void
  }
  useQuery: (name: string) => unknown
}

const navigate = vi.fn()
const lakebedRef = { current: null as TestLakebed | null }

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
  defineGlobal('HTMLElement', dom.window.HTMLElement)
  defineGlobal('MouseEvent', dom.window.MouseEvent)
  defineGlobal('Node', dom.window.Node)
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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { ProductDetailHero } = await import('./ProductDetailHero.tsx')

function createCommerceLakebedStub() {
  let version = 0
  let state = {
    items: [] as TestCartItem[],
    products: [] as TestProduct[],
  }
  const listeners = new Set<() => void>()
  const notify = () => {
    version += 1
    for (const listener of listeners) listener()
  }
  const summary = () => ({
    count: state.items.reduce((total, item) => total + item.quantity, 0),
    items: state.items,
  })

  const lakebed: TestLakebed = {
    useAuth: () => ({
      isAuthenticated: false,
      user: {
        displayName: 'Guest',
        email: '',
        id: 'guest:local',
        isGuest: true,
        provider: 'guest',
        userId: 'guest:local',
      },
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

      if (name === 'cartSummary') return summary()
      if (name === 'productCatalog') return state.products
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      const runMutation = useCallback(
        async (input: Record<string, unknown>) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'syncCatalog') {
              state = {
                ...state,
                products: (input?.products as TestProduct[] | undefined) ?? [],
              }
            }

            if (name === 'addItem') {
              const label = (input?.label as string) || 'Item'
              const existing = state.items.find((item) => item.label === label)
              state = {
                ...state,
                items: existing
                  ? state.items.map((item) =>
                      item.label === label
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                    )
                  : [
                      ...state.items,
                      {
                        id: `item-${state.items.length + 1}`,
                        label,
                        price: input?.price as string | undefined,
                        quantity: 1,
                      },
                    ],
              }
            }

            notify()
            return state
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
        const callable = ((input: Record<string, unknown>) =>
          runMutation(input)) as ReturnType<TestLakebed['useMutation']>
        callable.isPending = false
        callable.lastError = null
        callable.pendingCount = 0
        callable.reset = reset
        return callable
      }, [reset, runMutation])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }

  return { lakebed, state: () => state }
}

function CartCountProbe({ lakebed }: { lakebed: TestLakebed }) {
  const summary = lakebed.useQuery('cartSummary') as { count: number } | null
  return <output aria-label="Cart count">{summary?.count ?? 0}</output>
}

afterEach(() => {
  cleanup()
  navigate.mockReset()
  lakebedRef.current = null
})

describe('ProductDetailHero commerce behavior', () => {
  it('adds the buy-box product to the shared Lakebed cart without routing the primary CTA', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Component = ProductDetailHero.client.component

    render(
      <>
        <Component
          props={{
            description: 'Portable studio monitoring with low-latency audio.',
            imageAlt: 'Aurora Pro studio headphones product image',
            price: '$299',
            primaryCta: 'Add to Cart',
            title: 'Aurora Pro Headphones',
          }}
          statementId="product_detail_hero"
        />
        <CartCountProbe lakebed={lakebed} />
      </>,
    )

    await waitFor(() => {
      expect(state().products).toEqual([
        {
          imageAlt: 'Aurora Pro studio headphones product image',
          label: 'Aurora Pro Headphones',
          price: '$299',
          subtitle: 'Portable studio monitoring with low-latency audio.',
        },
      ])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Cart count').textContent).toBe('1')
    })
    expect(state().items).toEqual([
      {
        id: 'item-1',
        label: 'Aurora Pro Headphones - Midnight Black',
        price: '$299',
        quantity: 1,
      },
    ])
    expect(navigate).not.toHaveBeenCalledWith('Add to Cart')
  })

  it('treats the secondary Buy Now CTA as a cart purchase intent', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Component = ProductDetailHero.client.component

    render(
      <>
        <Component
          props={{
            price: '$299',
            primaryCta: 'Learn More',
            secondaryCta: 'Buy Now',
            title: 'Aurora Pro Headphones',
          }}
          statementId="product_detail_hero"
        />
        <CartCountProbe lakebed={lakebed} />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Buy Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Cart count').textContent).toBe('1')
    })
    expect(state().items).toEqual([
      {
        id: 'item-1',
        label: 'Aurora Pro Headphones - Midnight Black',
        price: '$299',
        quantity: 1,
      },
    ])
    expect(navigate).not.toHaveBeenCalledWith('Buy Now')
  })
})
