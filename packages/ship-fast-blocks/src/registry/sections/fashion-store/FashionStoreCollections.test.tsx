import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const navigate = vi.fn()
const { FashionStoreCollections } = await import('./FashionStoreCollections')

describe('FashionStoreCollections', () => {
  it('uses enough top padding to clear a fixed navbar', () => {
    const markup = renderToStaticMarkup(
      <FashionStoreCollections.component
        props={{
          eyebrow: 'Shop By Category',
          heading: 'The Collections',
          items: [
            { name: 'Outerwear', count: '42 pieces', imageAlt: 'Outerwear' },
          ],
        }}
      />,
    )
    // The section must have pt-28 (mobile) / lg:pt-32 (desktop) to clear the
    // fixed h-16 lg:h-20 navbar. py-20 lg:py-28 is insufficient — only 16px
    // of clearance on mobile.
    expect(markup).toContain('pt-28')
    expect(markup).toContain('lg:pt-32')
    // Bottom padding stays at the standard rhythm
    expect(markup).toContain('pb-20')
    expect(markup).toContain('lg:pb-28')
  })
})
