// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

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
const { SiteNav } = await import('./SiteNav.tsx')
const { BrandLogoProvider } = await import('./Logo.tsx')

afterEach(() => {
  cleanup()
  navigate.mockReset()
})

describe('SiteNav', () => {
  it('routes the brand action to Home when no explicit home target is provided', () => {
    render(
      <SiteNav
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Northridge' }))

    expect(navigate).toHaveBeenCalledWith('Home')
  })

  it('uses the shared mobile drawer and closes it after mobile navigation', async () => {
    render(
      <SiteNav
        brand="Northridge"
        nav={['Services', 'Pricing']}
        cta={{ label: 'Schedule Consultation', target: 'Contact' }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('dialog')).toBeTruthy()

    const pricingButtons = screen.getAllByRole('button', { name: 'Pricing' })
    const mobilePricingButton = pricingButtons.at(-1)
    if (!mobilePricingButton) throw new Error('Missing mobile pricing button')

    fireEvent.click(mobilePricingButton)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Pricing')
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('replaces the nav brand mark with the selected logo image', () => {
    render(
      <BrandLogoProvider
        value={{
          name: 'Linear',
          icon: 'https://cdn.test/linear-icon.png',
          logo: null,
        }}
      >
        <SiteNav
          brand="Northridge"
          brandMark={<span data-testid="fallback-mark">N</span>}
          nav={['Services']}
        />
      </BrandLogoProvider>,
    )

    expect(screen.queryByTestId('fallback-mark')).toBeNull()
    const image = document.querySelector(
      '[data-brand-logo-selected="true"] img',
    ) as HTMLImageElement
    expect(image).toBeInstanceOf(HTMLImageElement)
    expect(image.src).toBe('https://cdn.test/linear-icon.png')
    expect(screen.getByRole('button', { name: 'Northridge' })).toBeTruthy()
  })
})
