// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BrandLogoProvider, Logo } from './Logo.tsx'

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
        <Logo
          brand="Acme"
          fallback={<span data-testid="fallback-mark">A</span>}
          labelClassName="brand-label"
        />
      </BrandLogoProvider>,
    )

    expect(screen.getByTestId('fallback-mark')).toBeTruthy()
    expect(screen.getByText('Acme').className).toContain('brand-label')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('uses the selected icon in the brand mark slot', () => {
    render(
      <BrandLogoProvider value={selectedLogo}>
        <Logo
          brand="Acme"
          fallback={<span data-testid="fallback-mark">A</span>}
        />
      </BrandLogoProvider>,
    )

    expect(screen.queryByTestId('fallback-mark')).toBeNull()
    const image = document.querySelector(
      '[data-brand-logo-selected="true"] img',
    ) as HTMLImageElement
    expect(image).toBeInstanceOf(HTMLImageElement)
    expect(image.src).toBe(selectedLogo.icon)
    expect(screen.getByText('Acme')).toBeTruthy()
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
      ) as HTMLImageElement | null
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
