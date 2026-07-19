import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { saasPlan, useSyncSaasPlans } from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'
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
 * SaasPricing — a 3-tier pricing band for a B2B SaaS landing page. Thin
 * configuration over the shared `PricingGrid` composite: a centered heading +
 * intro above a responsive 3-column grid of plan cards (name, big price +
 * period, checkmark feature bullets, and a CTA button). The highlighted tier
 * gets a primary border, shadow, and a floating "Most popular" pill, and every
 * CTA routes through section-kit route links. Use to present subscription tiers for SaaS
 * products, apps, or online services. Renders fully with no props via baked-in
 * defaults.
 */
export const SaasPricing = defineCapsule({
  name: 'SaasPricing',
  description:
    "A 3-tier pricing band for a B2B SaaS landing page backed by shared Lakebed conversion state: a centered heading + intro above a responsive 3-column grid of plan cards (name, big price + period, checkmark feature bullets, and scoped mutation CTA button). The highlighted tier gets a primary border, shadow, and a floating 'Most popular' pill. Plans seed command search and every CTA records selected plan intent. Use to present subscription tiers for SaaS products, apps, or online services.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers; mark one with highlighted to feature it. */
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Pricing that scales with you'
    const subheading =
      props.subheading ??
      "Start free and upgrade when you're ready. No hidden fees, cancel anytime."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$0',
            period: '/mo',
            features: [
              'Up to 3 projects',
              'Community support',
              'Basic analytics',
              '1 team member',
            ],
            cta: 'Get started',
            highlighted: false,
          },
          {
            name: 'Pro',
            price: '$29',
            period: '/mo',
            features: [
              'Unlimited projects',
              'Priority email support',
              'Advanced analytics',
              'Up to 10 team members',
              'Custom integrations',
            ],
            cta: 'Start free trial',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Everything in Pro',
              'Dedicated success manager',
              'SSO & audit logs',
              'Unlimited team members',
              '99.9% uptime SLA',
            ],
            cta: 'Contact sales',
            highlighted: false,
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features.at(0) ?? '',
        }),
      ),
    )

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container className="flex flex-col gap-10">
          <SectionHeading title={heading} subtitle={subheading} />
          <PricingGrid>
            <SectionHeading
              title={'Pricing that scales with you'}
              subtitle={'Start free and upgrade when you'}
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
