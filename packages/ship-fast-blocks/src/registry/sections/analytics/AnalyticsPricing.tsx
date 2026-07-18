import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * AnalyticsPricing — three-tier pricing band for an analytics product, composing
 * the shared PricingGrid composite inside a padded section with an optional
 * centered SectionHeading. Renders Free ($0), a highlighted Pro ($49/mo), and a
 * Custom-priced Enterprise tier, each with a feature checklist and a routable
 * CTA. Sharp and data-forward. Use as the pricing band of any analytics, BI, or
 * data-product site. Renders fully with no props via baked-in defaults.
 */
export const AnalyticsPricing = defineCapsule({
  name: 'AnalyticsPricing',
  description:
    'Three-tier pricing band for an analytics product backed by shared Lakebed conversion state. Renders Free ($0), a highlighted Pro ($49/mo), and a Custom-priced Enterprise tier, each with a feature checklist and scoped mutation CTA. Plans seed command search and selected tiers update the shared navbar badge. Sharp and data-forward. Use as the pricing band of any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Start free, scale when you grow'
    const subheading =
      props.subheading ??
      'No credit card to start. Upgrade the moment your data does.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
              'Up to 1M events / month',
              '3 dashboards',
              '7-day data retention',
              'Community support',
            ],
            cta: 'Get started',
            ctaTarget: 'Start Free',
          },
          {
            name: 'Pro',
            price: '$49',
            period: '/mo',
            features: [
              'Up to 50M events / month',
              'Unlimited dashboards',
              '1-year data retention',
              'Smart alerts & funnels',
              'Priority email support',
            ],
            cta: 'Start free trial',
            ctaTarget: 'Start Free Trial',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited events',
              'SSO & advanced governance',
              'Custom data retention',
              'Dedicated success manager',
              '99.99% uptime SLA',
            ],
            cta: 'Contact sales',
            ctaTarget: 'Book a demo',
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section className={cn('bg-background py-20 sm:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="mb-14"
          />
          <PricingGrid
            tiers={tiers}
            heading="Start free, scale when you grow"
            subheading="No credit card to start. Upgrade the moment your data does."
            renderCta={(tier) => (
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={tier.cta ?? 'Get started'}
                plan={tier.name}
                source="pricing"
                aria-label={`${tier.cta} for ${tier.name}`}
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Selecting
                  </>
                }
                className={cn(
                  'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                {tier.cta ?? 'Get started'}
              </SaasPlanActionButton>
            )}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
