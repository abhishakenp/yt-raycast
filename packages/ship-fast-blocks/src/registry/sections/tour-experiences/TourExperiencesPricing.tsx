import { defineCapsule } from '#/capsules/openui.ts'
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
 * TourExperiencesPricing — tour-package pricing for an adventure / guided-tour
 * brand. Composes the shared PricingGrid composite as three per-person packages
 * (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition) each with a price,
 * "/ person" period, an inclusions list, and a "Book Now" CTA that routes via the
 * shared navigation. The Full-Day tier is highlighted as the most popular pick.
 * Use to present bookable tour tiers on tour-operator, expedition, and
 * travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesPricing = defineCapsule({
  name: 'TourExperiencesPricing',
  description:
    "Tour-package pricing for an adventure / guided-tour brand. Composes the shared PricingGrid composite as three per-person packages (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition) each with a price, '/ person' period, an inclusions list, and a 'Book Now' CTA routed via the shared navigation. The Full-Day tier is highlighted as the most popular pick. Use to present bookable tour tiers on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Tour packages (name, price, period, features, cta). */
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
            name: 'Half-Day Escape',
            price: '$89',
            period: '/ person',
            features: [
              '3-hour guided tour',
              'Small group (max 8)',
              'Local guide & insider stops',
              'Hotel pickup nearby',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
          },
          {
            name: 'Full-Day Expedition',
            price: '$159',
            period: '/ person',
            features: [
              'Full-day guided adventure',
              'Small group (max 8)',
              'Lunch & local tastings included',
              'All entry fees & gear',
              'Door-to-door transport',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
            highlighted: true,
          },
          {
            name: 'Multi-Day Expedition',
            price: '$640',
            period: '/ person',
            features: [
              '3-day guided expedition',
              'Boutique stays each night',
              'All meals & tastings',
              'Private guide & support crew',
              'Curated off-the-map routes',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
          },
        ]

    return (
      <section className="bg-background px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <PricingGrid className={props.className}>
            <SectionHeading
              title={props.heading ?? 'Pick your pace, book your seat'}
              subtitle={
                props.subheading ??
                'Transparent per-person pricing with everything you need included. No hidden fees, just unforgettable days out.'
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
        </div>
      </section>
    )
  },
})
