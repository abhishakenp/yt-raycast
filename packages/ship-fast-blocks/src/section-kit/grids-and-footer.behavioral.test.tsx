// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CtaBand,
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierTagline,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
  PricingTierCta,
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
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
        <FeatureGrid heading="What you get">
          <FeatureCard>
            <FeatureTitle>Fast launch</FeatureTitle>
            <FeatureDescription>A production-ready page.</FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
        <PricingGrid>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(
              [
                {
                  name: 'Pro',
                  price: '$29',
                  period: '/mo',
                  features: ['Exports', 'Deployments'],
                  cta: 'Start Pro',
                  ctaTarget: 'Checkout',
                },
              ] as Array<Record<string, unknown>>
            )
              .filter(Boolean)
              .map((raw, i) => {
                const t = raw as {
                  name: string
                  price: string
                  period?: string
                  unit?: string
                  tagline?: string
                  blurb?: string
                  badge?: string
                  features?: string[]
                  cta?: string
                  ctaTarget?: string
                  highlighted?: boolean
                  popular?: boolean
                  featured?: boolean
                }
                const highlighted = t.highlighted || t.popular || t.featured
                const badgeText =
                  t.badge ?? (highlighted ? 'Most popular' : null)
                const subtitle = t.tagline ?? t.blurb
                const periodLabel = t.period ?? t.unit
                return (
                  <PricingTier
                    key={i}
                    variant={highlighted ? 'highlighted' : 'default'}
                  >
                    {badgeText ? (
                      <PricingTierBadge>{badgeText}</PricingTierBadge>
                    ) : null}
                    <PricingTierHeader>
                      <PricingTierName>{t.name}</PricingTierName>
                      {subtitle ? (
                        <PricingTierTagline>{subtitle}</PricingTierTagline>
                      ) : null}
                      <div className="flex items-baseline gap-1">
                        <PricingTierPrice>{t.price}</PricingTierPrice>
                        {periodLabel ? (
                          <PricingTierPeriod>{periodLabel}</PricingTierPeriod>
                        ) : null}
                      </div>
                    </PricingTierHeader>
                    {Array.isArray(t.features) && t.features.length ? (
                      <PricingTierFeatures>
                        {t.features.map((feat, fi) => (
                          <PricingTierFeature key={fi}>
                            {feat}
                          </PricingTierFeature>
                        ))}
                      </PricingTierFeatures>
                    ) : null}
                    <PricingTierCta
                      target={t.ctaTarget ?? t.cta ?? 'Pricing'}
                      className={
                        highlighted
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-border bg-background text-foreground hover:bg-muted'
                      }
                    >
                      {t.cta ?? 'Get started'}
                    </PricingTierCta>
                  </PricingTier>
                )
              })}
          </div>
        </PricingGrid>
        <TestimonialGrid>
          <TestimonialCard>
            <TestimonialQuote>The site exported cleanly.</TestimonialQuote>
            <TestimonialAuthor>
              <TestimonialName>Maya</TestimonialName>
              <TestimonialMeta>Founder · Northwind</TestimonialMeta>
            </TestimonialAuthor>
          </TestimonialCard>
        </TestimonialGrid>
        <GalleryGrid>
          <GalleryGridItems>
            {(
              [
                {
                  alt: 'product dashboard preview',
                  caption: 'Dashboard preview',
                },
              ] as Array<Record<string, unknown>>
            )
              .filter(Boolean)
              .map((raw, i) => {
                const img = raw as { alt: string; caption?: string }
                return (
                  <GalleryTile key={i}>
                    <GalleryTileImage alt={img.alt} />
                    {img.caption ? (
                      <GalleryTileCaption>{img.caption}</GalleryTileCaption>
                    ) : null}
                  </GalleryTile>
                )
              })}
          </GalleryGridItems>
        </GalleryGrid>
        <StatGrid>
          <StatItem>
            <StatValue>48h</StatValue>
            <StatLabel>Launch time</StatLabel>
          </StatItem>
        </StatGrid>
        <CtaBand
          title="Ready to ship"
          actions={[{ label: 'Book a demo', target: 'Contact' }]}
        />
        <SiteFooter>
          <FooterContent>
            <FooterGrid>
              <FooterBrand brand="Northwind">
                <FooterSocial>
                  <FooterSocialLink href="https://linkedin.test">
                    LinkedIn
                  </FooterSocialLink>
                </FooterSocial>
              </FooterBrand>
              <FooterColumn>
                <FooterColumnTitle>Product</FooterColumnTitle>
                <FooterColumnList>
                  <li>
                    <FooterLink>Features</FooterLink>
                  </li>
                  <li>
                    <FooterLink>Pricing</FooterLink>
                  </li>
                </FooterColumnList>
              </FooterColumn>
            </FooterGrid>
            <FooterBottom>
              <FooterCopyright>
                © {new Date().getFullYear()} Northwind
              </FooterCopyright>
              <FooterLegal>
                <FooterLink>Privacy</FooterLink>
              </FooterLegal>
            </FooterBottom>
          </FooterContent>
        </SiteFooter>
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
      <SiteFooter>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand="Northwind" />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>
              © {new Date().getFullYear()} Northwind
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>,
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
    renderMalformed(<FeatureGrid heading="Features">{undefined}</FeatureGrid>)

    expect(screen.getByRole('heading', { name: 'Features' })).toBeTruthy()
  })

  it('does not crash when PricingGrid receives missing generated tiers', () => {
    renderMalformed(
      <PricingGrid>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(undefined as unknown as Array<Record<string, unknown>> | undefined)
            ?.filter(Boolean)
            .map((raw, i) => {
              const t = raw as {
                name: string
                price: string
                features?: string[]
              }
              return (
                <PricingTier key={i}>
                  <PricingTierHeader>
                    <PricingTierName>{t.name}</PricingTierName>
                    <PricingTierPrice>{t.price}</PricingTierPrice>
                  </PricingTierHeader>
                  {Array.isArray(t.features) && t.features.length ? (
                    <PricingTierFeatures>
                      {t.features.map((feat, fi) => (
                        <PricingTierFeature key={fi}>{feat}</PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  ) : null}
                </PricingTier>
              )
            })}
        </div>
      </PricingGrid>,
    )
  })

  it('does not crash when TestimonialGrid receives missing generated items', () => {
    renderMalformed(<TestimonialGrid>{undefined}</TestimonialGrid>)
  })

  it('does not crash when GalleryGrid receives missing generated images', () => {
    renderMalformed(
      <GalleryGrid>
        <GalleryGridItems>
          {(undefined as unknown as Array<Record<string, unknown>> | undefined)
            ?.filter(Boolean)
            .map((raw, i) => {
              const img = raw as { alt: string; caption?: string }
              return (
                <GalleryTile key={i}>
                  <GalleryTileImage alt={img.alt} />
                  {img.caption ? (
                    <GalleryTileCaption>{img.caption}</GalleryTileCaption>
                  ) : null}
                </GalleryTile>
              )
            })}
        </GalleryGridItems>
      </GalleryGrid>,
    )
  })

  it('does not crash when StatGrid receives missing generated stats', () => {
    renderMalformed(<StatGrid>{undefined}</StatGrid>)
  })

  it('does not crash when FeatureGrid receives malformed generated feature items', () => {
    renderMalformed(
      <FeatureGrid>
        {null}
        <FeatureCard>
          <FeatureTitle>Valid</FeatureTitle>
          <FeatureDescription>Still renders</FeatureDescription>
        </FeatureCard>
      </FeatureGrid>,
    )

    expect(screen.getByText('Valid')).toBeTruthy()
  })

  it('does not crash when PricingGrid receives malformed generated tier features', () => {
    renderMalformed(
      <PricingGrid>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(
            [
              { name: 'Starter', price: '$0', features: undefined },
              { name: 'Team', price: '$49', features: 'Exports' },
            ] as Array<Record<string, unknown>>
          )
            .filter(Boolean)
            .map((raw, i) => {
              const t = raw as {
                name: string
                price: string
                features?: string[]
              }
              return (
                <PricingTier key={i}>
                  <PricingTierHeader>
                    <PricingTierName>{t.name}</PricingTierName>
                    <PricingTierPrice>{t.price}</PricingTierPrice>
                  </PricingTierHeader>
                  {Array.isArray(t.features) && t.features.length ? (
                    <PricingTierFeatures>
                      {t.features.map((feat, fi) => (
                        <PricingTierFeature key={fi}>{feat}</PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  ) : null}
                </PricingTier>
              )
            })}
        </div>
      </PricingGrid>,
    )

    expect(screen.getByText('Starter')).toBeTruthy()
  })

  it('does not crash when TestimonialGrid receives malformed generated items', () => {
    renderMalformed(
      <TestimonialGrid>
        <TestimonialCard>
          <TestimonialQuote>Works</TestimonialQuote>
          <TestimonialAuthor>
            <TestimonialName>Ada</TestimonialName>
          </TestimonialAuthor>
        </TestimonialCard>
        {null}
      </TestimonialGrid>,
    )

    expect(screen.getByText(/Works/)).toBeTruthy()
  })

  it('does not crash when GalleryGrid receives malformed generated image items', () => {
    renderMalformed(
      <GalleryGrid>
        <GalleryGridItems>
          {(
            [{ alt: 'gallery item' }, null] as Array<Record<
              string,
              unknown
            > | null>
          )
            .filter(Boolean)
            .map((raw, i) => {
              const img = raw as { alt: string; caption?: string }
              return (
                <GalleryTile key={i}>
                  <GalleryTileImage alt={img.alt} />
                  {img.caption ? (
                    <GalleryTileCaption>{img.caption}</GalleryTileCaption>
                  ) : null}
                </GalleryTile>
              )
            })}
        </GalleryGridItems>
      </GalleryGrid>,
    )

    expect(screen.getByRole('img', { name: 'gallery item' })).toBeTruthy()
  })

  it('does not crash when SiteFooter receives malformed generated column links', () => {
    renderMalformed(
      <SiteFooter>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand="Northwind" />
            <FooterColumn>
              <FooterColumnTitle>Product</FooterColumnTitle>
              <FooterColumnList>
                <li>{null}</li>
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
        </FooterContent>
      </SiteFooter>,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
    expect(screen.getByText('Product')).toBeTruthy()
  })

  it('does not crash when SiteFooter receives malformed generated social links', () => {
    renderMalformed(
      <SiteFooter>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand="Northwind">
              <FooterSocial>{null}</FooterSocial>
            </FooterBrand>
          </FooterGrid>
        </FooterContent>
      </SiteFooter>,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
  })

  it('does not crash when SiteFooter receives malformed generated legal links', () => {
    renderMalformed(
      <SiteFooter>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand="Northwind" />
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>
              © {new Date().getFullYear()} Northwind
            </FooterCopyright>
            <FooterLegal>{null}</FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>,
    )

    expect(screen.getAllByText(/Northwind/).length).toBeGreaterThan(0)
  })
})
