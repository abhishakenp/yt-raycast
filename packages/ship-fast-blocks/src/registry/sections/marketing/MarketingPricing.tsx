import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { Container } from '#/section-kit/Container.tsx'

/**
 * MarketingPricing — a centered-header 3-tier pricing table for a SaaS /
 * product-marketing landing page. Thin configuration over the shared `PricingGrid`
 * composite: a bold heading + supporting line over a responsive grid of bordered
 * plan cards — name, big price + period, a checkmarked feature list, and a
 * full-width CTA; the "most popular" plan gets a primary ring + a floating
 * "Most popular" badge and a filled CTA. CTAs route through useNavigate. Use as
 * the pricing section for B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingPricing = defineCapsule({
  name: 'MarketingPricing',
  description:
    "Centered-header 3-tier pricing table for a SaaS / product-marketing landing page: a bold heading + supporting line over a responsive 1/2/3-column grid of bordered plan cards (name, big price + period, description, a checkmarked feature list, and a full-width CTA); the 'most popular' plan gets a primary ring, a floating 'most popular' badge and a filled CTA, and cards lift slightly on hover. Clean premium indigo-on-light aesthetic; CTAs route through useNavigate. Use as the pricing section for B2B SaaS, productivity, or developer-platform pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    /** Label on the badge over the highlighted plan. */
    popularLabel: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            description: 'Perfect for personal projects and small experiments.',
            price: '$0',
            period: '/mo',
            features: [
              'Up to 3 projects',
              'Basic task boards',
              'Community support',
            ],
            cta: 'Get started free',
            popular: false,
          },
          {
            name: 'Pro',
            description: 'For growing teams that need power and flexibility.',
            price: '$12',
            period: '/user/mo',
            features: [
              'Unlimited projects',
              'Advanced analytics',
              'Automated workflows',
              'Priority support',
            ],
            cta: 'Start free trial',
            popular: true,
          },
          {
            name: 'Enterprise',
            description:
              'For organizations with advanced security and scale needs.',
            price: 'Custom',
            period: '',
            features: [
              'SSO & SCIM provisioning',
              'Dedicated success manager',
              'Custom contracts & SLA',
            ],
            cta: 'Contact sales',
            popular: false,
          },
        ]

    return (
      <section className={cn('py-20', props.className)}>
        <Container size="lg" className="px-6 lg:px-6">
          <PricingGrid>
            <SectionHeading title={heading} subtitle={description} />
            {plans
              .map((plan) => ({
                name: plan.name,
                price: plan.price,
                period: plan.period,
                features: plan.features,
                cta: plan.cta,
                highlighted: plan.popular,
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
