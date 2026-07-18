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
 * FlightSimulatorPricing — a 3-tier editions table for a flight simulator
 * landing page. Thin configuration over the shared `PricingGrid` composite: a
 * centered heading above three edition cards (Standard, Deluxe, Premium) with a
 * one-time price, a feature list of included aircraft and airports, and a buy
 * CTA on each. The middle Deluxe tier is highlighted as the recommended pick.
 * Use to sell editions of a flight sim, airliner / combat sim, or aviation
 * title. Renders fully with no props via baked defaults.
 */
export const FlightSimulatorPricing = defineCapsule({
  name: 'FlightSimulatorPricing',
  description:
    '3-tier editions table for a flight-simulator landing page built on the shared PricingGrid composite: a centered heading above three edition cards (Standard, Deluxe, Premium) each with a one-time price, a feature list of included aircraft and airports, and a buy CTA. The middle Deluxe tier is highlighted as the recommended pick and every CTA routes to the buy page. Use to sell editions of a flight sim, airliner / combat sim, or aviation title.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Navigation target for every edition CTA. */
    ctaTarget: z.string().optional(),
    /** Pricing tiers: name, price, period, features, cta, highlighted. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Choose your edition'
    const ctaTarget = props.ctaTarget ?? 'Buy'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Standard',
            price: '$59.99',
            period: 'one-time',
            features: [
              '20 hand-crafted aircraft',
              '30 detailed airports',
              'Global photoreal scenery',
              'Live real-world weather',
              'Multiplayer & shared skies',
            ],
            cta: 'Buy Standard',
          },
          {
            name: 'Deluxe',
            price: '$89.99',
            period: 'one-time',
            features: [
              'Everything in Standard',
              '35 aircraft, incl. 5 study-level',
              '40 detailed airports',
              'Enhanced airliner systems',
              'Priority content updates',
            ],
            cta: 'Buy Deluxe',
            highlighted: true,
          },
          {
            name: 'Premium',
            price: '$119.99',
            period: 'one-time',
            features: [
              'Everything in Deluxe',
              '50 aircraft, incl. 10 study-level',
              '50 hand-built hub airports',
              'Full VR support & hardware kit',
              'Exclusive livery & mission packs',
            ],
            cta: 'Buy Premium',
          },
        ]

    const tiersWithTarget = tiers.map((t) => ({ ...t, ctaTarget }))

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <PricingGrid>
            <SectionHeading title={heading} subtitle={props.subheading} />
            {tiersWithTarget.map((tier) => {
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
