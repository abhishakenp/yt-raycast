// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BrandLogoProvider, Logo, LogoImage, LogoLabel } from './Logo.tsx'

const selectedLogo = {
  name: 'Linear',
  domain: 'linear.app',
  brandId: 'linear',
  icon: 'https://cdn.test/linear-icon.png',
  logo: 'https://cdn.test/linear-logo.png',
}

afterEach(() => {
  cleanup()
})

describe('Logo', () => {
  it('renders the supplied fallback mark when no brand logo is selected', () => {
    render(
      <BrandLogoProvider value={null}>
        <Logo brand="Acme" className="custom-logo">
          <LogoImage fallback={<span data-testid="fallback-mark">A</span>} />
          <LogoLabel className="brand-label" />
        </Logo>
      </BrandLogoProvider>,
    )

    expect(screen.getByTestId('fallback-mark')).toBeTruthy()
    expect(screen.getByText('Acme').className).toContain('brand-label')
    expect(
      screen.getByText('Acme').closest('[data-slot="logo"]')?.className,
    ).toContain('inline-flex')
    expect(
      screen.getByText('Acme').closest('[data-slot="logo"]')?.className,
    ).toContain('custom-logo')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('uses the selected icon in the brand mark slot', () => {
    render(
      <BrandLogoProvider value={selectedLogo}>
        <Logo brand="Acme">
          <LogoImage fallback={<span data-testid="fallback-mark">A</span>} />
          <LogoLabel />
        </Logo>
      </BrandLogoProvider>,
    )

    expect(screen.queryByTestId('fallback-mark')).toBeNull()
    const image = document.querySelector(
      '[data-brand-logo-selected="true"] img',
    )
    expect(image).toBeInstanceOf(HTMLImageElement)
    if (!(image instanceof HTMLImageElement)) {
      throw new Error('Selected logo image did not render')
    }
    expect(image.src).toBe(selectedLogo.icon)
    expect(screen.getByText('Acme')).toBeTruthy()
  })

  it('does not tag the wordmark wrapper or text label as data-d-role="image"', () => {
    // Regression: Logo wrapper and LogoLabel (text) used to carry
    // data-d-role="image", which made the design-presets.css rule
    // [data-d-role="image"] { box-shadow: var(--d-shadow-image, ...) }
    // stamp a brutalist hard shadow onto the wordmark text. Only the
    // actual <img> (LogoImage) should carry the image role.
    render(
      <BrandLogoProvider value={selectedLogo}>
        <Logo brand="Acme">
          <LogoImage fallback={<span data-testid="fallback-mark">A</span>} />
          <LogoLabel />
        </Logo>
      </BrandLogoProvider>,
    )

    const label = screen.getByText('Acme')
    expect(label.getAttribute('data-d-role')).toBeNull()
    const wrapper = label.closest('[data-slot="logo"]')
    expect(wrapper?.getAttribute('data-d-role')).toBeNull()
    // LogoImage keeps the image role so real images still get shadow/radius/filter
    const imageSlot = document.querySelector('[data-slot="logo-image"]')
    expect(imageSlot?.getAttribute('data-d-role')).toBe('image')
  })

  it('patches legacy capsule brand marks that have not migrated to Logo yet', async () => {
    const { rerender } = render(
      <BrandLogoProvider value={selectedLogo}>
        <div data-openui-component="CafeNavbar">
          <button type="button">
            <svg
              aria-hidden="true"
              className="size-8 text-primary"
              data-testid="legacy-mark"
            />
            <span>Little Owl Coffee</span>
          </button>
        </div>
      </BrandLogoProvider>,
    )

    await waitFor(() => {
      const image = document.querySelector(
        '[data-brand-logo-runtime-slot="true"] img',
      )
      if (!(image instanceof HTMLImageElement)) {
        throw new Error('Runtime logo image did not render')
      }
      expect(image?.src).toBe(selectedLogo.icon)
    })

    expect(screen.getByTestId('legacy-mark').style.display).toBe('none')

    rerender(
      <BrandLogoProvider value={null}>
        <div data-openui-component="CafeNavbar">
          <button type="button">
            <svg
              aria-hidden="true"
              className="size-8 text-primary"
              data-testid="legacy-mark"
            />
            <span>Little Owl Coffee</span>
          </button>
        </div>
      </BrandLogoProvider>,
    )

    await waitFor(() => {
      expect(
        document.querySelector('[data-brand-logo-runtime-slot="true"]'),
      ).toBeNull()
    })
  })
})
