import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const navigate = vi.fn()
const { FashionStoreLookbook } = await import('./FashionStoreLookbook')

describe('FashionStoreLookbook', () => {
  it('uses enough top padding to clear a fixed navbar', () => {
    const markup = renderToStaticMarkup(
      <FashionStoreLookbook.component
        props={{
          eyebrow: 'Inspiration',
          heading: 'Curated Lookbook',
          description: 'See how tradition blends with contemporary style.',
          cta: 'View Full Lookbook',
          items: [
            {
              look: 'Monsoon Magic',
              title: 'Rain-kissed Elegance',
              imageAlt: 'Model in pastel silk saree',
              size: 'feature',
            },
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
