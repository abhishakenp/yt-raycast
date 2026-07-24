import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  CommerceAdapter,
  CommerceCatalogAdapter,
  CommercePaymentProvider,
  CommerceProduct,
  CommerceRuntimeCart,
  CommerceShippingOption,
} from './commerce-contracts'
import { CommerceProvider, useCommerce } from './commerce-provider'

const fallbackProduct: (sourceId: string, title: string) => CommerceProduct = (
  sourceId,
  title,
) => ({
  collections: [],
  handle: sourceId.replace('product:', ''),
  images: [],
  options: [],
  sourceId,
  tags: [],
  title,
  variants: [
    {
      manageInventory: false,
      optionValues: {},
      prices: [{ amount: 12, currencyCode: 'usd' }],
      sourceId: `variant:${sourceId}`,
      title: 'Default',
    },
  ],
})

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
    }
  >
    {children}
  </QueryClientProvider>
)

const CatalogState = () => {
  const commerce = useCommerce()
  return (
    <>
      <output data-testid="status">{commerce.status}</output>
      <output data-testid="mode">{commerce.mode}</output>
      <output data-testid="titles">
        {commerce.catalog.map(({ product }) => product.title).join('|')}
      </output>
      <output data-testid="purchasable">
        {commerce.catalog.every(({ purchasable }) => purchasable)
          ? 'yes'
          : 'no'}
      </output>
      <output data-testid="message">{commerce.error?.message ?? ''}</output>
      <output data-testid="details">
        {JSON.stringify(
          commerce.catalog.map(({ product }) => ({
            image: product.images[0]?.url,
            price: product.variants[0]?.prices[0]?.amount,
            sourceId: product.sourceId,
            title: product.title,
          })),
        )}
      </output>
    </>
  )
}

let currentCommerceController: ReturnType<typeof useCommerce> | undefined

const readCommerceController = () => {
  if (currentCommerceController === undefined) {
    throw new Error('Commerce controller was not rendered.')
  }
  return currentCommerceController
}

const ControllerProbe = () => {
  currentCommerceController = useCommerce()
  const commerce = currentCommerceController
  return (
    <>
      <output data-testid="cart-id">{commerce?.cart?.id ?? ''}</output>
      <output data-testid="cart-pending">
        {commerce?.cartPending ? 'yes' : 'no'}
      </output>
      <output data-testid="checkout-pending">
        {commerce?.checkoutPending ? 'yes' : 'no'}
      </output>
      <output data-testid="checkout-order">
        {commerce?.checkout?.order?.id ?? ''}
      </output>
      <output data-testid="checkout-error">
        {commerce?.checkoutError?.message ?? ''}
      </output>
      <output data-testid="shipping-options">
        {commerce?.checkout?.shippingOptions
          .map((option) => option.name)
          .join('|') ?? ''}
      </output>
      <output data-testid="payment-providers">
        {commerce?.checkout?.paymentProviders
          .map((provider) => provider.name)
          .join('|') ?? ''}
      </output>
      <output data-testid="payment-action">
        {commerce?.checkout?.paymentAction.type ?? ''}
      </output>
    </>
  )
}

const runtimeCart: (
  id: string,
  lineIds?: Array<string>,
) => CommerceRuntimeCart = (id, lineIds = []) => ({
  id,
  lines: lineIds.map((lineId) => ({ id: lineId })),
})

const shippingOption: (id: string, name: string) => CommerceShippingOption = (
  id,
  name,
) => ({
  amount: { amount: 5, currencyCode: 'usd' },
  id,
  name,
})

const paymentProvider: (id: string, name: string) => CommercePaymentProvider = (
  id,
  name,
) => ({
  id,
  name,
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  currentCommerceController = undefined
})

describe('CommerceProvider', () => {
  it('loads and binds a hosted catalog through the tenant query', async () => {
    const adapter: CommerceCatalogAdapter = {
      catalog: async () => ({
        products: [
          {
            ...fallbackProduct('product:shirt', 'Admin Shirt'),
            variants: [
              {
                available: true,
                id: 'variant_live',
                manageInventory: false,
                optionValues: {},
                prices: [{ amount: 18, currencyCode: 'usd' }],
                sourceId: 'variant:shirt',
                title: 'Default',
              },
            ],
          },
        ],
      }),
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[fallbackProduct('product:shirt', 'Fallback Shirt')]}
        mode="hosted"
        regionId="region-us"
        scope="sessions"
        tenant="session-a"
      >
        <CatalogState />
      </CommerceProvider>,
      { wrapper },
    )

    await waitFor(() =>
      expect(screen.getByTestId('status').textContent).toBe('ready'),
    )
    expect(screen.getByTestId('titles').textContent).toBe('Admin Shirt')
    expect(screen.getByTestId('mode').textContent).toBe('hosted')
    expect(screen.getByTestId('purchasable').textContent).toBe('yes')
  })

  it('keeps generated visuals non-purchasable with an actionable degraded error', async () => {
    const adapter: CommerceCatalogAdapter = {
      catalog: async () => {
        throw new Error('Medusa timed out')
      },
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[fallbackProduct('product:shirt', 'Fallback Shirt')]}
        mode="hosted"
        scope="sessions"
        tenant="session-a"
      >
        <CatalogState />
      </CommerceProvider>,
      { wrapper },
    )

    await waitFor(() =>
      expect(screen.getByTestId('status').textContent).toBe('degraded'),
    )
    expect(screen.getByTestId('titles').textContent).toBe('Fallback Shirt')
    expect(screen.getByTestId('purchasable').textContent).toBe('no')
    expect(screen.getByTestId('message').textContent).toBe('Medusa timed out')
  })

  it('polls hosted catalogs for authoritative edits, additions, deletions, and degraded recovery', async () => {
    vi.useFakeTimers()
    const fallbackShirt = fallbackProduct('product:shirt', 'Fallback Shirt')
    const fallbackHat = fallbackProduct('product:hat', 'Fallback Hat')
    const initialShirt = {
      ...fallbackShirt,
      images: [{ url: '/old-shirt.jpg' }],
      title: 'Initial Shirt',
    }
    const initialHat = {
      ...fallbackHat,
      images: [{ url: '/hat.jpg' }],
      title: 'Initial Hat',
    }
    const editedShirt = {
      ...fallbackShirt,
      images: [{ url: '/edited-shirt.jpg' }],
      title: 'Edited Shirt',
      variants: [
        {
          ...fallbackShirt.variants[0],
          prices: [{ amount: 39, currencyCode: 'usd' }],
        },
      ],
    }
    const adminProduct = fallbackProduct(
      'medusa_product_admin',
      'Admin Product',
    )
    const catalog = vi
      .fn<CommerceCatalogAdapter['catalog']>()
      .mockResolvedValueOnce({ products: [initialShirt, initialHat] })
      .mockResolvedValueOnce({ products: [editedShirt, adminProduct] })
      .mockRejectedValueOnce(new Error('Medusa refresh failed'))
    const adapter: CommerceCatalogAdapter = { catalog }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[fallbackShirt, fallbackHat]}
        mode="hosted"
        scope="sessions"
        tenant="session-polling"
      >
        <CatalogState />
      </CommerceProvider>,
      { wrapper },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByTestId('status').textContent).toBe('ready')
    expect(screen.getByTestId('titles').textContent).toBe(
      'Initial Shirt|Initial Hat',
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_001)
    })
    expect(screen.getByTestId('details').textContent).toBe(
      JSON.stringify([
        {
          image: '/edited-shirt.jpg',
          price: 39,
          sourceId: 'product:shirt',
          title: 'Edited Shirt',
        },
        {
          price: 12,
          sourceId: 'medusa_product_admin',
          title: 'Admin Product',
        },
      ]),
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_001)
    })
    expect(screen.getByTestId('status').textContent).toBe('degraded')
    expect(screen.getByTestId('titles').textContent).toBe(
      'Fallback Shirt|Fallback Hat',
    )
    expect(screen.getByTestId('message').textContent).toBe(
      'Medusa refresh failed',
    )
    expect(catalog).toHaveBeenCalledTimes(3)
  })

  it('does not poll demo catalogs', async () => {
    vi.useFakeTimers()
    const adapter: CommerceCatalogAdapter = {
      catalog: vi.fn(async () => ({ products: [] })),
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[]}
        mode="demo"
        scope="sessions"
        tenant="session-demo"
      >
        <CatalogState />
      </CommerceProvider>,
      { wrapper },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    expect(adapter.catalog).toHaveBeenCalledTimes(1)
  })

  it('does not call an adapter when commerce is disabled', async () => {
    let calls = 0
    const adapter: CommerceCatalogAdapter = {
      catalog: async () => {
        calls += 1
        return { products: [] }
      },
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[fallbackProduct('product:shirt', 'Fallback Shirt')]}
        mode="disabled"
        scope="sessions"
        tenant="session-a"
      >
        <CatalogState />
      </CommerceProvider>,
      { wrapper },
    )

    expect(screen.getByTestId('status').textContent).toBe('disabled')
    expect(screen.getByTestId('titles').textContent).toBe('Fallback Shirt')
    expect(screen.getByTestId('purchasable').textContent).toBe('no')
    await Promise.resolve()
    expect(calls).toBe(0)
  })

  it('creates a tenant cart once and serializes concurrent item mutations through the latest cart', async () => {
    const calls: Array<string> = []
    let resolver: (() => void) | undefined
    const firstMutationStarted = new Promise<void>((resolve) => {
      resolver = resolve
    })
    const adapter: CommerceAdapter = {
      addItem: vi.fn(async (input, cartId) => {
        calls.push(`add:${input.variantId}:${cartId ?? ''}`)
        if (input.variantId === 'variant_1') {
          resolver?.()
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { cart: runtimeCart('cart_live', ['line_1']) }
        }
        return { cart: runtimeCart('cart_live', ['line_1', 'line_2']) }
      }),
      addShippingMethod: vi.fn(async () => ({
        cart: runtimeCart('cart_live'),
      })),
      catalog: async () => ({ products: [] }),
      completeCart: vi.fn(async () => ({
        order: {
          id: 'order_unused',
          lines: [],
          status: 'completed',
          store: { kind: 'sessions', sessionId: 'session-a' },
          subtotal: { amount: 0, currencyCode: 'usd' },
          total: { amount: 0, currencyCode: 'usd' },
        },
      })),
      createCart: vi.fn(async () => {
        calls.push('create')
        return { cart: runtimeCart('cart_live') }
      }),
      createPaymentSessions: vi.fn(async () => ({
        paymentAction: { type: 'none' },
        paymentSessions: [],
      })),
      getCart: vi.fn(async () => {
        throw new Error('No stored cart')
      }),
      getPaymentProviders: vi.fn(async () => ({ paymentProviders: [] })),
      getShippingOptions: vi.fn(async () => ({ shippingOptions: [] })),
      removeItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[]}
        mode="hosted"
        regionId="region_us"
        scope="sessions"
        tenant="session-a"
      >
        <ControllerProbe />
      </CommerceProvider>,
      { wrapper },
    )

    await waitFor(() => expect(readCommerceController().status).toBe('ready'))
    const firstAdd = readCommerceController().addItem({
      quantity: 1,
      variantId: 'variant_1',
    })
    await firstMutationStarted
    const secondAdd = readCommerceController().addItem({
      quantity: 2,
      variantId: 'variant_2',
    })

    await act(async () => {
      await Promise.all([firstAdd, secondAdd])
    })

    expect(calls).toEqual([
      'create',
      'add:variant_1:cart_live',
      'add:variant_2:cart_live',
    ])
    expect(screen.getByTestId('cart-id').textContent).toBe('cart_live')
    expect(screen.getByTestId('cart-pending').textContent).toBe('no')
  })

  it('preserves the previous cart when a mutation fails', async () => {
    const adapter: CommerceAdapter = {
      addItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      addShippingMethod: vi.fn(async () => ({
        cart: runtimeCart('cart_live'),
      })),
      catalog: async () => ({ products: [] }),
      completeCart: vi.fn(async () => {
        throw new Error('unused')
      }),
      createCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      createPaymentSessions: vi.fn(async () => ({
        paymentAction: { type: 'none' },
        paymentSessions: [],
      })),
      getCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      getPaymentProviders: vi.fn(async () => ({ paymentProviders: [] })),
      getShippingOptions: vi.fn(async () => ({ shippingOptions: [] })),
      removeItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateItem: vi.fn(async () => {
        throw new Error('Inventory changed')
      }),
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[]}
        mode="hosted"
        scope="sessions"
        tenant="session-a"
      >
        <ControllerProbe />
      </CommerceProvider>,
      { wrapper },
    )

    await waitFor(() => expect(readCommerceController().status).toBe('ready'))
    await act(async () => {
      await readCommerceController().addItem({
        quantity: 1,
        variantId: 'variant_1',
      })
    })
    await act(async () => {
      await expect(
        readCommerceController().updateItem('line_1', { quantity: 3 }),
      ).rejects.toThrow('Inventory changed')
    })

    expect(screen.getByTestId('cart-id').textContent).toBe('cart_live')
    await waitFor(() =>
      expect(screen.getByTestId('checkout-error').textContent).toBe(
        'Inventory changed',
      ),
    )
  })

  it('requires explicit shipping and payment selection before completing checkout', async () => {
    const calls: Array<string> = []
    const adapter: CommerceAdapter = {
      addItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      addShippingMethod: vi.fn(async (input, cartId) => {
        calls.push(`ship:${input.shippingOptionId}:${cartId ?? ''}`)
        return { cart: runtimeCart('cart_live', ['line_1']) }
      }),
      catalog: async () => ({ products: [] }),
      completeCart: vi.fn(async (input, cartId) => {
        calls.push(`complete:${input?.idempotencyKey ?? ''}:${cartId ?? ''}`)
        return {
          order: {
            id: 'order_123',
            lines: [],
            status: 'completed',
            store: { kind: 'sessions', sessionId: 'session-a' },
            subtotal: { amount: 10, currencyCode: 'usd' },
            total: { amount: 15, currencyCode: 'usd' },
          },
        }
      }),
      createCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      createPaymentSessions: vi.fn(async (input, cartId) => {
        calls.push(`pay:${input.providerId}:${cartId ?? ''}`)
        return {
          paymentAction: { type: 'none' },
          paymentSessions: [
            {
              id: 'pay_session_1',
              provider: input.providerId,
              status: 'pending',
            },
          ],
        }
      }),
      getCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      getPaymentProviders: vi.fn(async () => ({
        paymentProviders: [paymentProvider('pp_system', 'System')],
      })),
      getShippingOptions: vi.fn(async () => ({
        shippingOptions: [
          shippingOption('so_express', 'Express'),
          shippingOption('so_ground', 'Ground'),
        ],
      })),
      removeItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateCart: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
      updateItem: vi.fn(async () => ({ cart: runtimeCart('cart_live') })),
    }

    render(
      <CommerceProvider
        adapter={adapter}
        fallbackProducts={[]}
        mode="hosted"
        scope="sessions"
        tenant="session-a"
      >
        <ControllerProbe />
      </CommerceProvider>,
      { wrapper },
    )

    await waitFor(() => expect(readCommerceController().status).toBe('ready'))
    await act(async () => {
      await readCommerceController().addItem({
        quantity: 1,
        variantId: 'variant_1',
      })
      await readCommerceController().loadShippingOptions()
      await readCommerceController().selectShippingMethod('so_ground')
      await readCommerceController().loadPaymentProviders()
      await readCommerceController().createPaymentSession('pp_system')
      await readCommerceController().completeCart('idempotency-1')
    })

    expect(calls).toEqual([
      'ship:so_ground:cart_live',
      'pay:pp_system:cart_live',
      'complete:idempotency-1:cart_live',
    ])
    expect(screen.getByTestId('shipping-options').textContent).toBe(
      'Express|Ground',
    )
    expect(screen.getByTestId('payment-providers').textContent).toBe('System')
    expect(screen.getByTestId('payment-action').textContent).toBe('none')
    expect(screen.getByTestId('checkout-order').textContent).toBe('order_123')
    expect(screen.getByTestId('cart-id').textContent).toBe('')
  })
})
