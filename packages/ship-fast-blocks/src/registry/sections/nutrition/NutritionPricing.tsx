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
 * NutritionPricing — three-tier pricing section for a nutrition-coaching or
 * wellness subscription, built on the shared PricingGrid kit composite. Renders
 * an optional heading + subheading above Starter / Pro / Elite plan cards, each
 * with price, billing period, a feature checklist, and a routable CTA; the Pro
 * tier is highlighted with a "Most popular" pill and primary border. All props
 * are optional with baked defaults so it renders standalone. Use on nutrition
 * coaches, dietitians, meal-plan subscriptions, diet / wellness programs or
 * healthy-eating apps to present membership options.
 */
export const NutritionPricing = defineCapsule({
  name: 'NutritionPricing',
  description:
    "Three-tier pricing section for a nutrition-coaching or wellness subscription, built on the shared PricingGrid kit composite: an optional heading + subheading above Starter / Pro / Elite plan cards, each with price, billing period, a feature checklist, and a routable CTA; the Pro tier is highlighted with a 'Most popular' pill and primary border. Use on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps to present membership options.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const heading = props.heading ?? 'Plans that grow with your goals'
    const subheading =
      props.subheading ??
      'Start fresh today. Cancel anytime—no contracts, no crash diets, just sustainable progress.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$19',
            period: '/mo',
            features: [
              'Personalized meal plan',
              'Recipe library access',
              'Basic progress tracking',
              'Weekly email check-ins',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
          },
          {
            name: 'Pro',
            price: '$49',
            period: '/mo',
            features: [
              'Everything in Starter',
              '1-on-1 dietitian coaching',
              'Custom macro targets',
              'Grocery list automation',
              'Priority chat support',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
            highlighted: true,
          },
          {
            name: 'Elite',
            price: '$99',
            period: '/mo',
            features: [
              'Everything in Pro',
              'Weekly 1:1 video sessions',
              'Lab & biomarker reviews',
              'Performance & sport nutrition',
              '24/7 priority support',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
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
