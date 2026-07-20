// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type {
  CommerceCatalogAdapter,
  CommerceProduct,
} from '../commerce/commerce-contracts'
import { CommerceProvider } from '../commerce/commerce-provider'

const lakebed = {
  useMutation: () => async () => undefined,
  useQuery: (name: string) =>
    name === 'commerceSearchState'
      ? { query: '', selectedLabel: '' }
      : undefined,
}

vi.mock('@ship-fast/lakebed/react', async () => {
  const actual = await vi.importActual<
    typeof import('@ship-fast/lakebed/react')
  >('@ship-fast/lakebed/react')
  return {
    ...actual,
    createLakebedClient: () => lakebed,
  }
})

vi.mock('#/lib/img.tsx', () => ({
  Image: ({
    alt,
    src,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    h?: number
    w?: number
  }) => <img alt={alt} src={src} {...props} />,
}))

const product = (
  sourceId: string,
  handle: string,
  title: string,
  image: string,
  amount: number,
): CommerceProduct => ({
  collections: [],
  handle,
  images: [{ url: image }],
  options: [],
  sourceId,
  tags: [],
  thumbnail: image,
  title,
  variants: [
    {
      available: true,
      calculatedPrice: { amount, currencyCode: 'usd' },
      id: `variant_${handle}`,
      manageInventory: false,
      optionValues: {},
      prices: [{ amount, currencyCode: 'usd' }],
      sourceId: `variant:${handle}`,
      title: 'Default',
    },
  ],
})

const { EcommerceGallery } = await import('./EcommerceGallery')

afterEach(cleanup)

describe('EcommerceGallery commerce runtime', () => {
  it('renders duplicate fallback titles as independently bound live products', async () => {
    const fallbackProducts = [
      product(
        'product:left-shirt',
        'left-shirt',
        'Classic Shirt',
        '/fallback-left.jpg',
        20,
      ),
      product(
        'product:right-shirt',
        'right-shirt',
        'Classic Shirt',
        '/fallback-right.jpg',
        20,
      ),
    ]
    const adapter: CommerceCatalogAdapter = {
      catalog: async () => ({
        products: [
          product(
            'product:right-shirt',
            'right-shirt',
            'Right Admin Shirt',
            '/right.jpg',
            32,
          ),
          product(
            'product:left-shirt',
            'left-shirt',
            'Left Admin Shirt',
            '/left.jpg',
            28,
          ),
        ],
      }),
    }
    const Gallery = EcommerceGallery.client.component

    render(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false } },
          })
        }
      >
        <CommerceProvider
          adapter={adapter}
          fallbackProducts={fallbackProducts}
          mode="hosted"
          scope="sessions"
          tenant="session-a"
        >
          <Gallery
            props={{
              products: [
                {
                  handle: 'left-shirt',
                  name: 'Classic Shirt',
                  price: '$20',
                  sourceId: 'product:left-shirt',
                },
                {
                  handle: 'right-shirt',
                  name: 'Classic Shirt',
                  price: '$20',
                  sourceId: 'product:right-shirt',
                },
              ],
            }}
            statementId="gallery"
          />
        </CommerceProvider>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Left Admin Shirt')).toBeTruthy()
      expect(screen.getByText('Right Admin Shirt')).toBeTruthy()
    })
    expect(screen.getByAltText('Left Admin Shirt').getAttribute('src')).toBe(
      '/left.jpg',
    )
    expect(screen.getByAltText('Right Admin Shirt').getAttribute('src')).toBe(
      '/right.jpg',
    )
    expect(screen.getAllByRole('button', { name: 'Add to cart' })).toSatisfy(
      (buttons: Array<HTMLElement>) =>
        buttons.every((button) => !button.hasAttribute('disabled')),
    )
  })
})
