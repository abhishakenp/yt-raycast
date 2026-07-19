import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FitnessPricing — 3-tier membership pricing block for a gym or fitness studio. A
 * centered heading + lead paragraph above a 3-column grid of plan cards (the
 * "popular" tier inverted to a primary-filled card with a corner ribbon), each with
 * a name, tagline, big price + period, a check/cross feature list, and a full-width
 * CTA button, plus a centered footnote underneath. CTAs route through section-kit route links.
 * Use for membership tiers / plans on gyms, fitness studios, yoga or boxing studios.
 */
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
export const FitnessPricing = defineCapsule({
  name: 'FitnessPricing',
  description:
    "Three-tier membership pricing block for a gym or fitness studio: a centered heading and lead paragraph above a 3-column grid of plan cards (the 'popular' tier inverted to a primary-filled card with a corner ribbon), each with a name, tagline, big price plus period, a check / cross feature list and a full-width CTA button, plus a centered footnote underneath. CTAs route through section-kit route links. Use for membership tiers, plans or pricing on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    footnote: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          popular: z.boolean().optional(),
          features: z.array(
            z.object({
              label: z.string(),
              included: z.boolean(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingHeading = props.heading ?? 'Membership tiers'
    const pricingDesc =
      props.description ??
      'Flexible options to fit your lifestyle. All plans include full facility access and app booking.'
    const pricingFootnote =
      props.footnote ??
      'All memberships include a 7-day free trial. No initiation fees. Cancel anytime.'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Base Access',
            tagline: 'Perfect for self-guided workouts',
            price: '$79',
            period: '/month',
            cta: 'Choose Base',
            popular: false,
            features: [
              {
                label: 'Full gym floor access',
                included: true,
              },
              {
                label: 'Locker rooms & amenities',
                included: true,
              },
              {
                label: 'App access for booking',
                included: true,
              },
              {
                label: 'Group classes',
                included: false,
              },
              {
                label: 'Personal training',
                included: false,
              },
            ],
          },
          {
            name: 'Unlimited',
            tagline: 'All classes, all the time',
            price: '$149',
            period: '/month',
            cta: 'Choose Unlimited',
            popular: true,
            features: [
              {
                label: 'Everything in Base Access',
                included: true,
              },
              {
                label: 'Unlimited group classes',
                included: true,
              },
              {
                label: 'Priority booking (7 days)',
                included: true,
              },
              {
                label: 'Guest passes (2/month)',
                included: true,
              },
              {
                label: 'Personal training',
                included: false,
              },
            ],
          },
          {
            name: 'Elite',
            tagline: 'Personalized training + classes',
            price: '$299',
            period: '/month',
            cta: 'Choose Elite',
            popular: false,
            features: [
              {
                label: 'Everything in Unlimited',
                included: true,
              },
              {
                label: '4 personal training sessions',
                included: true,
              },
              {
                label: 'Quarterly fitness assessment',
                included: true,
              },
              {
                label: 'Nutrition consultation',
                included: true,
              },
              {
                label: 'Guest passes (4/month)',
                included: true,
              },
            ],
          },
        ]
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={pricingHeading}
            subtitle={pricingDesc}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold text-foreground md:text-4xl"
            subtitleClassName="text-muted-foreground"
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

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {pricingFootnote}
          </p>
        </Container>
      </section>
    )
  },
})
