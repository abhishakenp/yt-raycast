import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  CommerceCatalogAdapter,
  CommerceProduct,
} from './commerce-contracts'
import { CommerceProvider, useCommerce } from './commerce-provider'

const fallbackProduct = (sourceId: string, title: string): CommerceProduct => ({
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

afterEach(() => {
  cleanup()
  vi.useRealTimers()
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
})
