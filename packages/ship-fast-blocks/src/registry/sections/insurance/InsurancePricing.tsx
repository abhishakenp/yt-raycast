import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsurancePricing — 3-tier transparent pricing table for an insurance page. On
 * a soft muted canvas: a centered eyebrow chip + heading + lede above a 3-column
 * grid of plan cards (name, tagline, big monthly price + period, an included/
 * excluded feature checklist with check or cross icons, and a CTA button). The
 * "Most Popular" plan is highlighted with a brand border, lift and a top badge.
 * CTAs route through useNavigate. Use as the pricing section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
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
export const InsurancePricing = defineCapsule({
  name: 'InsurancePricing',
  description:
    "3-tier transparent pricing table for an insurance page on a soft muted canvas: a centered eyebrow chip + heading + lede above a 3-column grid of plan cards (name, tagline, big monthly price + period, an included/excluded feature checklist with check or cross icons, and a CTA button). The 'Most Popular' plan is highlighted with a brand border, upward lift and a top badge. CTAs route through useNavigate. Use as the pricing section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Badge label shown on the popular plan. */
    popularLabel: z.string().optional(),
    /** Pricing plans. */
    plans: z
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
    const eyebrow = props.eyebrow ?? 'Transparent Pricing'
    const heading = props.heading ?? 'Simple, upfront pricing'
    const description =
      props.description ??
      "No hidden fees, no surprises. Choose the coverage level that's right for you."
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential',
            tagline: 'Basic coverage for budget-conscious families',
            price: '$89',
            period: '/month',
            cta: 'Get Started',
            popular: false,
            features: [
              {
                label: '$100K liability coverage',
                included: true,
              },
              {
                label: '$500 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: false,
              },
            ],
          },
          {
            name: 'Complete',
            tagline: 'Comprehensive protection for peace of mind',
            price: '$149',
            period: '/month',
            cta: 'Get Started',
            popular: true,
            features: [
              {
                label: '$500K liability coverage',
                included: true,
              },
              {
                label: '$250 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: true,
              },
              {
                label: 'Personal umbrella policy',
                included: true,
              },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Maximum protection for high-value assets',
            price: '$229',
            period: '/month',
            cta: 'Contact Sales',
            popular: false,
            features: [
              {
                label: '$1M liability coverage',
                included: true,
              },
              {
                label: '$100 deductible',
                included: true,
              },
              {
                label: 'Priority claims processing',
                included: true,
              },
              {
                label: 'Full identity restoration',
                included: true,
              },
              {
                label: 'Dedicated agent',
                included: true,
              },
            ],
          },
        ]
    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary"
            titleClassName="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-6xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Simple, upfront pricing'}
              subtitle={
                'No hidden fees, no surprises. Choose the coverage level that'
              }
            />
            {plans
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
