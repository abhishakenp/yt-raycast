import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { saasPlan, useSyncSaasPlans } from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CrmPricing — centered 3-tier pricing table for a CRM / SaaS landing page on a
 * subtle muted band. A heading + supporting paragraph above a responsive 3-up
 * grid of plan cards: name, blurb, large price + unit, a checklist of included
 * features (green checks) plus optional crossed-out excluded features, and a
 * full-width CTA; the featured plan inverts to a filled primary surface with a
 * floating "Most Popular" badge. CTAs route through useNavigate. Use to present
 * tiered subscription pricing for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
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
export const CrmPricing = defineCapsule({
  name: 'CrmPricing',
  description:
    'Centered 3-tier pricing table for a CRM / SaaS landing page backed by shared Lakebed conversion state: a heading + supporting paragraph above responsive plan cards with name, blurb, large price + unit, feature checklist, optional excluded features, and scoped mutation CTAs. Plans seed command search and every CTA records selected plan or sales intent. Use to present tiered subscription pricing for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans; mark one featured for the highlighted column. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()).optional(),
          cta: z.string(),
          featured: z.boolean().optional(),
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
      "No hidden fees. Start free, upgrade when you're ready. Annual plans save 20%."
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            description: 'For individuals and small teams getting started.',
            price: '$19',
            unit: '/user/month',
            features: [
              'Up to 1,000 contacts',
              'Visual pipeline',
              'Basic reporting',
              'Email integration',
            ],
            excluded: ['API access'],
            cta: 'Start free trial',
          },
          {
            name: 'Professional',
            description: 'For growing teams that need automation and insights.',
            price: '$49',
            unit: '/user/month',
            features: [
              'Unlimited contacts',
              'Custom pipeline stages',
              'Workflow automation',
              'Advanced analytics',
              'API access + webhooks',
            ],
            cta: 'Start free trial',
            featured: true,
          },
          {
            name: 'Enterprise',
            description: 'For large organizations with custom needs.',
            price: '$99',
            unit: '/user/month',
            features: [
              'Everything in Professional',
              'SSO & advanced security',
              'Dedicated account manager',
              'Custom integrations',
              'SLA guarantee',
            ],
            cta: 'Contact sales',
          },
        ]
    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.unit,
          price: plan.price,
          summary: plan.description || plan.features.at(0) || '',
        }),
      ),
    )
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const XIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    void Check
    void XIcon
    return (
      <section className={cn('bg-muted/50 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid>
            <SectionHeading
              title={'Simple, transparent pricing'}
              subtitle={'No hidden fees. Start free, upgrade when you'}
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
