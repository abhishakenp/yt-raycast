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
 * SpaWellnessPricing — membership & package tiers for a day-spa / wellness page.
 * Thin configuration over the shared `PricingGrid` composite: a centered heading
 * + intro above a responsive 3-column grid of membership cards (name, price +
 * billing period, checkmark perk bullets, and a CTA). The highlighted tier gets
 * a primary border, shadow, and a floating "Most popular" pill, and every CTA
 * routes through section-kit route links. Use to present spa memberships, treatment
 * packages, or wellness bundles. Renders fully with no props via baked-in
 * defaults.
 */
export const SpaWellnessPricing = defineCapsule({
  name: 'SpaWellnessPricing',
  description:
    'Membership & package tiers for a day-spa / wellness page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of membership cards (name, price + billing period, checkmark perk bullets, and a CTA). The highlighted tier gets a primary border, shadow, and a floating pill, and every CTA routes through section-kit route links. Use to present spa memberships, treatment packages, or wellness bundles.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Membership / package tiers; mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Memberships & packages'
    const subheading =
      props.subheading ??
      'Make rest a ritual. Choose a plan that keeps you coming back to calm all year long.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Day Pass',
            price: '$45',
            period: '/visit',
            features: [
              'Full facility access',
              'Sauna & steam room',
              'Relaxation lounge',
              'Herbal tea bar',
            ],
            cta: 'Book a Pass',
            highlighted: false,
          },
          {
            name: 'Monthly Renew',
            price: '$129',
            period: '/mo',
            features: [
              'One signature treatment monthly',
              'Unlimited facility access',
              '15% off additional services',
              'Priority booking',
              'Complimentary guest pass',
            ],
            cta: 'Join Now',
            highlighted: true,
          },
          {
            name: 'Annual Sanctuary',
            price: '$1,290',
            period: '/yr',
            features: [
              'Two treatments every month',
              'Unlimited facility access',
              '20% off all services & products',
              'Dedicated wellness concierge',
              'Seasonal members-only events',
            ],
            cta: 'Become a Member',
            highlighted: false,
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
            <SectionHeading title={heading} subtitle={subheading} />
            {tiers
              .map((t) => ({
                name: t.name,
                price: t.price,
                period: t.period,
                features: t.features,
                cta: t.cta,
                ctaTarget: t.cta,
                highlighted: t.highlighted,
              }))
              .map((tier) => {
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
                      <PricingTierBadge>
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
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
                      {t.unit && (
                        <PricingTierPeriod>{t.unit}</PricingTierPeriod>
                      )}
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
