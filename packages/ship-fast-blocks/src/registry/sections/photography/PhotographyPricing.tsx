import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
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
} from '#/section-kit/PricingGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * PhotographyPricing — session-package pricing for a fine-art / wedding
 * photographer site. Thin configuration over the shared `PricingGrid`
 * composite: a centered serif header above three responsive tier cards
 * (portrait, full-day wedding, destination), each with a price, a coverage
 * line, an inclusions list, and a routable "Book a Shoot" CTA. The middle
 * wedding tier is highlighted with a "Most popular" pill. Each CTA routes
 * through section-kit route links. Use to present collections for photographers, studios,
 * and elopement shooters. Renders fully with no props via baked-in defaults.
 */
export const PhotographyPricing = defineCapsule({
  name: 'PhotographyPricing',
  description:
    "Session-package pricing for a fine-art / wedding photographer site built on the shared PricingGrid composite: a centered serif header above three responsive tier cards (portrait, full-day wedding, destination), each with a price, a coverage period line, an inclusions list, and a routable 'Book a Shoot' CTA, with the middle wedding tier highlighted by a 'Most popular' pill. Each CTA routes through section-kit route links. Use to present collections and session packages for photographers, studios, and elopement shooters.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers: name, price, coverage period, inclusions, CTA, highlight. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Portrait Session',
            price: '$450',
            period: '/ session',
            features: [
              'Up to 90 minutes of coverage',
              'One location of your choice',
              '40+ edited high-resolution images',
              'Private online gallery',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
          },
          {
            name: 'Full-Day Wedding',
            price: '$3,800',
            period: '/ day',
            features: [
              'Up to 10 hours of coverage',
              'Second photographer included',
              '600+ edited images, delivered in 4 weeks',
              'Engagement session included',
              'Heirloom print credit',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
            highlighted: true,
          },
          {
            name: 'Destination',
            price: '$5,500',
            period: '+ travel',
            features: [
              'Multi-day elopement coverage',
              'Travel & lodging coordinated',
              'Full edited gallery, no image cap',
              'Custom film & album add-ons',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
          },
        ]
    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <PricingGrid>
            <SectionHeading
              title={props.heading ?? 'Session packages'}
              subtitle={
                props.subheading ??
                'Transparent collections for portraits, weddings, and destinations — every package includes a personal gallery and full editing.'
              }
            />
            {tiers.map((tier) => {
              const t = tier as {
                name: string
                price: string
                features?: string[]
                cta?: string
                ctaTarget?: string
                tagline?: string
                blurb?: string
                description?: string
                audience?: string
                period?: string
                unit?: string
                cadence?: string
                suffix?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                badge?: string
                popularLabel?: string
                excluded?: string[]
                annual?: string
                priceSuffix?: string
                note?: string
              }
              return (
                <PricingTier
                  key={t.name}
                  variant={
                    t.highlighted || t.featured || t.popular
                      ? 'highlighted'
                      : undefined
                  }
                >
                  {t.highlighted || t.featured || t.popular ? (
                    <PricingTierBadge>{t.badge ?? 'Popular'}</PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName>{t.name}</PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline>{t.tagline}</PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline>{t.blurb}</PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline>{t.description}</PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline>{t.audience}</PricingTierTagline>
                    )}
                    <PricingTierPrice>{t.price}</PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod>{t.period}</PricingTierPeriod>
                    )}
                    {t.unit && <PricingTierPeriod>{t.unit}</PricingTierPeriod>}
                    {t.cadence && (
                      <PricingTierPeriod>{t.cadence}</PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod>{t.suffix}</PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures>
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <PricingTierCta target={t.ctaTarget}>
                      {t.cta}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
