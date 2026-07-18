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

/**
 * ComingSoonPricing — three-tier pricing table for a "launching soon" / waitlist
 * pre-launch landing page. Thin configuration over the shared `PricingGrid`
 * composite: a centered heading and lead paragraph above a responsive grid of
 * plan cards — each with a name, price + period, a feature checklist, and a CTA
 * button. The featured plan is highlighted with a "Most popular" pill. All CTA
 * buttons route through useNavigate. Use as the pricing / plans section on SaaS
 * waitlists, app pre-launch pages, or beta sign-up landers. Renders fully with
 * no props via three baked-in default plans.
 */
export const ComingSoonPricing = defineCapsule({
  name: 'ComingSoonPricing',
  description:
    "Three-tier pricing table for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead above a responsive 1/3-column grid of plan cards with name, tagline, price + period, feature checklist with check icons, and a CTA button. The featured plan gets a primary-colored background, shadow, and floating badge. CTAs route through useNavigate. Use as the pricing / plans section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Choose the plan that fits your team. All plans include a 14-day free trial.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'For small teams getting started',
            price: '$0',
            period: '/month',
            features: [
              'Up to 5 team members',
              '10GB storage',
              'Basic integrations',
              'Community support',
            ],
            cta: 'Get started free',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For growing teams',
            price: '$12',
            period: '/user/month',
            features: [
              'Unlimited team members',
              '100GB storage',
              'Advanced integrations',
              'Priority support',
              'Analytics dashboard',
            ],
            cta: 'Start 14-day trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            tagline: 'For large organizations',
            price: '$49',
            period: '/user/month',
            features: [
              'Everything in Pro',
              'Unlimited storage',
              'SSO & SCIM',
              'Custom contracts',
              'Dedicated success manager',
            ],
            cta: 'Contact sales',
            featured: false,
          },
        ]

    return (
      <section
        className={cn(
          'w-full px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-5xl">
          <PricingGrid>
            <SectionHeading title={heading} subtitle={description} />
            {plans
              .map((plan) => ({
                name: plan.name,
                price: plan.price,
                period: plan.period,
                features: plan.features,
                cta: plan.cta,
                highlighted: plan.featured,
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
        </div>
      </section>
    )
  },
})
