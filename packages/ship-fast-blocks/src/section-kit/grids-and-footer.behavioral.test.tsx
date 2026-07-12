// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CtaBand,
  FeatureGrid,
  GalleryGrid,
  PricingGrid,
  SiteFooter,
  StatGrid,
  TestimonialGrid,
} from './index.ts'

const navigate = vi.fn()

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => navigate,
}))

afterEach(() => {
  cleanup()
  navigate.mockReset()
})

function renderMalformed(ui: React.ReactElement) {
  expect(() => render(ui)).not.toThrow()
}

describe('section-kit grids and footer', () => {
  it('renders real generated content and routes interactive actions', () => {
    render(
      <>
        <FeatureGrid
          heading="What you get"
          features={[
            { title: 'Fast launch', description: 'A production-ready page.' },
          ]}
        />
        <PricingGrid
          tiers={[
            {
              name: 'Pro',
              price: '$29',
              period: '/mo',
              features: ['Exports', 'Deployments'],
              cta: 'Start Pro',
              ctaTarget: 'Checkout',
            },
          ]}
        />
        <TestimonialGrid
          items={[
            {
              quote: 'The site exported cleanly.',
              name: 'Maya',
              role: 'Founder',
              company: 'Northwind',
              rating: 5,
            },
          ]}
        />
        <GalleryGrid
          images={[
            {
              alt: 'product dashboard preview',
              caption: 'Dashboard preview',
            },
          ]}
        />
        <StatGrid stats={[{ value: '48h', label: 'Launch time' }]} />
        <CtaBand
          title="Ready to ship"
          actions={[{ label: 'Book a demo', target: 'Contact' }]}
        />
        <SiteFooter
          brand="Northwind"
          columns={[{ title: 'Product', links: ['Features', 'Pricing'] }]}
          social={[{ label: 'LinkedIn', href: 'https://linkedin.test' }]}
          legal={['Privacy']}
        />
      </>,
    )

    expect(screen.getByRole('heading', { name: 'What you get' })).toBeTruthy()
    expect(screen.getByText('Fast launch')).toBeTruthy()
    expect(screen.getByText('Exports')).toBeTruthy()
    expect(screen.getByText(/The site exported cleanly/)).toBeTruthy()
    expect(
      screen.getByRole('img', { name: 'product dashboard preview' }),
    ).toBeTruthy()
    expect(screen.getByText('48h')).toBeTruthy()
    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Start Pro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Book a demo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))
    fireEvent.click(screen.getByRole('button', { name: 'Privacy' }))

    expect(navigate).toHaveBeenCalledWith('Checkout')
    expect(navigate).toHaveBeenCalledWith('Contact')
    expect(navigate).toHaveBeenCalledWith('Pricing')
    expect(navigate).toHaveBeenCalledWith('Privacy')
  })

  it('does not crash when AI output omits optional collection props', () => {
    renderMalformed(
      <CtaBand
        title="Ready"
        actions={
          undefined as unknown as Parameters<typeof CtaBand>[0]['actions']
        }
      />,
    )
    renderMalformed(
      <SiteFooter
        brand="Northwind"
        columns={
          undefined as unknown as Parameters<typeof SiteFooter>[0]['columns']
        }
        social={
          undefined as unknown as Parameters<typeof SiteFooter>[0]['social']
        }
        legal={
          undefined as unknown as Parameters<typeof SiteFooter>[0]['legal']
        }
      />,
    )

    expect(screen.getByText('Ready')).toBeTruthy()
    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
  })

  it('does not crash when CtaBand receives malformed generated actions', () => {
    renderMalformed(
      <CtaBand
        title="Ready"
        actions={
          [
            null,
            { label: 'Contact', target: 'Contact' },
          ] as unknown as Parameters<typeof CtaBand>[0]['actions']
        }
      />,
    )

    expect(screen.getByText('Ready')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Contact' })).toBeTruthy()
  })

  it('does not crash when FeatureGrid receives missing generated features', () => {
    renderMalformed(
      <FeatureGrid
        heading="Features"
        features={
          undefined as unknown as Parameters<typeof FeatureGrid>[0]['features']
        }
      />,
    )

    expect(screen.getByRole('heading', { name: 'Features' })).toBeTruthy()
  })

  it('does not crash when PricingGrid receives missing generated tiers', () => {
    renderMalformed(
      <PricingGrid
        tiers={
          undefined as unknown as Parameters<typeof PricingGrid>[0]['tiers']
        }
      />,
    )
  })

  it('does not crash when TestimonialGrid receives missing generated items', () => {
    renderMalformed(
      <TestimonialGrid
        items={
          undefined as unknown as Parameters<typeof TestimonialGrid>[0]['items']
        }
      />,
    )
  })

  it('does not crash when GalleryGrid receives missing generated images', () => {
    renderMalformed(
      <GalleryGrid
        images={
          undefined as unknown as Parameters<typeof GalleryGrid>[0]['images']
        }
      />,
    )
  })

  it('does not crash when StatGrid receives missing generated stats', () => {
    renderMalformed(
      <StatGrid
        stats={undefined as unknown as Parameters<typeof StatGrid>[0]['stats']}
      />,
    )
  })

  it('does not crash when FeatureGrid receives malformed generated feature items', () => {
    renderMalformed(
      <FeatureGrid
        features={
          [
            null,
            { title: 'Valid', description: 'Still renders' },
          ] as unknown as Parameters<typeof FeatureGrid>[0]['features']
        }
      />,
    )

    expect(screen.getByText('Valid')).toBeTruthy()
  })

  it('does not crash when PricingGrid receives malformed generated tier features', () => {
    renderMalformed(
      <PricingGrid
        tiers={
          [
            {
              name: 'Starter',
              price: '$0',
              features: undefined,
            },
            {
              name: 'Team',
              price: '$49',
              features: 'Exports',
            },
          ] as unknown as Parameters<typeof PricingGrid>[0]['tiers']
        }
      />,
    )

    expect(screen.getByText('Starter')).toBeTruthy()
  })

  it('does not crash when TestimonialGrid receives malformed generated items', () => {
    renderMalformed(
      <TestimonialGrid
        items={
          [
            {
              quote: 'Works',
              name: 'Ada',
              rating: 5,
            },
            null,
          ] as unknown as Parameters<typeof TestimonialGrid>[0]['items']
        }
      />,
    )

    expect(screen.getByText(/Works/)).toBeTruthy()
  })

  it('does not crash when GalleryGrid receives malformed generated image items', () => {
    renderMalformed(
      <GalleryGrid
        images={
          [{ alt: 'gallery item' }, null] as unknown as Parameters<
            typeof GalleryGrid
          >[0]['images']
        }
      />,
    )

    expect(screen.getByRole('img', { name: 'gallery item' })).toBeTruthy()
  })

  it('does not crash when SiteFooter receives malformed generated column links', () => {
    renderMalformed(
      <SiteFooter
        brand="Northwind"
        columns={
          [{ title: 'Product', links: undefined }] as unknown as Parameters<
            typeof SiteFooter
          >[0]['columns']
        }
      />,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
    expect(screen.getByText('Product')).toBeTruthy()
  })

  it('does not crash when SiteFooter receives malformed generated social links', () => {
    renderMalformed(
      <SiteFooter
        brand="Northwind"
        social={[null] as unknown as Parameters<typeof SiteFooter>[0]['social']}
      />,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
  })

  it('does not crash when SiteFooter receives malformed generated legal links', () => {
    renderMalformed(
      <SiteFooter
        brand="Northwind"
        legal={[null] as unknown as Parameters<typeof SiteFooter>[0]['legal']}
      />,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
  })
})
