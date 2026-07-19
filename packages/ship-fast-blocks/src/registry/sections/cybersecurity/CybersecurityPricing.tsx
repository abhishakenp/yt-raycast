import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { saasPlan, useSyncSaasPlans } from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

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

/**
 * CybersecurityPricing — three-tier pricing table. A muted-band section with a
 * centered heading + subheading above a 3-column grid of plan cards. The
 * featured plan inverts to the dark brand surface, lifts upward, and shows a
 * floating badge; each card lists a name, blurb, large price + period,
 * check-marked feature list, and a full-width CTA routing through useNavigate.
 * Use to present subscription tiers for cybersecurity vendors, SOC/MDR
 * providers, or any B2B security SaaS. Renders fully with no props via baked-in
 * Starter / Professional / Enterprise defaults.
 */
export const CybersecurityPricing = defineCapsule({
  name: 'CybersecurityPricing',
  description:
    'Three-tier pricing table backed by shared Lakebed conversion state: a muted-band section with a centered heading + subheading above plan cards. Plans seed command search and each CTA records selected plan or sales intent with scoped loading. Use to present subscription tiers for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Pricing plans (set featured + badge on the highlighted tier). */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string().optional(),
          cta: z.string(),
          features: z.array(z.string()),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Choose the plan that fits your security needs. All plans include our core AI detection engine.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            blurb: 'For small teams getting started with security',
            price: '$999',
            period: '/month',
            cta: 'Start free trial',
            features: [
              'Up to 100 endpoints',
              'Email support (business hours)',
              'Basic threat detection',
              'Weekly security reports',
              '1 cloud account',
            ],
          },
          {
            name: 'Professional',
            blurb: 'For growing companies with complex infrastructure',
            price: '$4,999',
            period: '/month',
            cta: 'Start free trial',
            featured: true,
            badge: 'MOST POPULAR',
            features: [
              'Up to 1,000 endpoints',
              '24/7 phone & email support',
              'Advanced AI threat detection',
              'Real-time security dashboard',
              '5 cloud accounts',
              'Compliance reporting (SOC 2, ISO)',
              'API access',
            ],
          },
          {
            name: 'Enterprise',
            blurb: 'For large organizations with custom requirements',
            price: 'Custom',
            cta: 'Contact sales',
            features: [
              'Unlimited endpoints',
              'Dedicated account manager',
              'Custom AI model training',
              'Unlimited cloud accounts',
              'On-premise deployment option',
              'Custom SLA & response times',
              'White-glove onboarding',
            ],
          },
        ]

    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.period,
          price: plan.price,
          summary: plan.blurb || plan.features.at(0) || '',
        }),
      ),
    )

    return (
      <section className={cn('bg-muted/50 py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid>
            <SectionHeading
              title={'Simple, transparent pricing'}
              subtitle={
                'Choose the plan that fits your security needs. All plans include our core AI detection engine.'
              }
            />
            {plans.map((tier) => {
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
