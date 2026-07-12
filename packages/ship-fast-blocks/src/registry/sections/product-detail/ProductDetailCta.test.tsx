// @vitest-environment jsdom

import type { ComponentType } from 'react'
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'

type TestCartItem = {
  id: string
  label: string
  price?: string
  quantity: number
}

type TestLakebed = {
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
      if (!lakebedRef.current) throw new Error('Missing test Lakebed client')
      return lakebedRef.current
    }),
  }
})

if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  })
  const defineGlobal = (name, value) => {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    })
  }
  const requestAnimationFrame = (callback) =>
    setTimeout(() => callback(Date.now()), 0)
  const cancelAnimationFrame = (id) => clearTimeout(id)

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

const { cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { ProductDetailCta } = await import('./ProductDetailCta.tsx')

function createCommerceLakebedStub() {
  let version = 0
  let state = {
    items: [] as TestCartItem[],
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
      return null
    },
    useMutation: (name) => {
      const [pendingCount, setPendingCount] = useState(0)
      const [lastError, setLastError] = useState<unknown | null>(null)
      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      const runMutation = useCallback(
        async (input) => {
          setPendingCount((count) => count + 1)
          setLastError(null)

          try {
            if (name === 'addItem') {
              const label = input?.label ?? 'Item'
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
                        price: input?.price,
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
        const callable = ((input) => runMutation(input)) as ReturnType<
          TestLakebed['useMutation']
        >
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

describe('ProductDetailCta commerce behavior', () => {
  it('mutates the shared cart for Add to Cart intent and still routes secondary actions', async () => {
    const { lakebed, state } = createCommerceLakebedStub()
    lakebedRef.current = lakebed
    const Component = ProductDetailCta.client.component as ComponentType<any>

    render(
      <>
        <Component
          props={{
            actions: [
              { label: 'Add to Cart', variant: 'primary' },
              { label: 'Learn More', target: 'Features', variant: 'outline' },
            ],
            productPrice: '$299',
            productTitle: 'Aurora Pro Headphones',
          }}
          statementId="product_detail_cta"
        />
        <CartCountProbe lakebed={lakebed} />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Cart count').textContent).toBe('1')
    })
    expect(state().items).toEqual([
      {
        id: 'item-1',
        label: 'Aurora Pro Headphones',
        price: '$299',
        quantity: 1,
      },
    ])
    expect(navigate).not.toHaveBeenCalledWith('Add to Cart')

    fireEvent.click(screen.getByRole('button', { name: 'Learn More' }))
    expect(navigate).toHaveBeenCalledWith('Features')
  })
})
