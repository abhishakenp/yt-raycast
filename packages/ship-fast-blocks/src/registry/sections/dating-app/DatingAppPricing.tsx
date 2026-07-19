import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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

/**
 * DatingAppPricing — a 3-tier pricing table for a dating / matchmaking app. Sits on
 * a soft muted band: a centered heading + supporting paragraph above three card
 * tiers, where the featured tier gains a primary ring, shadow, and a centered
 * "Most Popular" badge. Each card shows name, tagline, big price + period, a
 * check/cross feature checklist, and a full-width CTA (filled for the featured tier,
 * outlined otherwise) routed through useNavigate. Use to present Free / Premium /
 * Elite plans for dating apps, singles platforms, or subscription products.
 * Renders fully with no props via baked-in tier defaults.
 */
export const DatingAppPricing = defineCapsule({
  name: 'DatingAppPricing',
  description:
    "3-tier pricing table for a dating / matchmaking app on a soft muted band: a centered heading + supporting paragraph above three card tiers, where the featured tier gains a primary ring, shadow, and a centered 'Most Popular' badge. Each card shows name, tagline, big price + period, a check/cross feature checklist, and a full-width CTA (filled for the featured tier, outlined otherwise) routed through useNavigate. Use to present Free / Premium / Elite plans for dating apps, singles platforms, or subscription products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
          features: z.array(
            z.object({ label: z.string(), included: z.boolean() }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingHeading = props.heading ?? 'Choose your journey'
    const pricingDesc =
      props.description ??
      "Start free, upgrade when you're ready for more connections."
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            tagline: 'Get started with the basics',
            price: '$0',
            period: '/month',
            cta: 'Get Started',
            featured: false,
            features: [
              { label: '10 likes per day', included: true },
              { label: 'Basic matching', included: true },
              { label: 'Chat with matches', included: true },
              { label: 'See who liked you', included: false },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Unlock your full potential',
            price: '$29',
            period: '/month',
            cta: 'Start Free Trial',
            featured: true,
            badge: 'Most Popular',
            features: [
              { label: 'Unlimited likes', included: true },
              { label: 'See who liked you', included: true },
              { label: 'Advanced filters', included: true },
              { label: 'Video dates included', included: true },
              { label: 'Priority support', included: true },
            ],
          },
          {
            name: 'Elite',
            tagline: 'The ultimate experience',
            price: '$49',
            period: '/month',
            cta: 'Go Elite',
            featured: false,
            features: [
              { label: 'Everything in Premium', included: true },
              { label: 'Profile boost monthly', included: true },
              { label: 'Read receipts', included: true },
              { label: 'Exclusive events access', included: true },
            ],
          },
        ]

    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <SectionHeading
            title={pricingHeading}
            subtitle={pricingDesc}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            {pricingTiers
              .map((t) => ({
                ...t,
                features: Array.isArray(t.features)
                  ? t.features.map((f) => (typeof f === 'string' ? f : f.label))
                  : t.features,
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
