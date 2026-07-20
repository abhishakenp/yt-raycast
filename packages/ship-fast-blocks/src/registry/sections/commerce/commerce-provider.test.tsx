import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

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
    </>
  )
}

afterEach(cleanup)

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
