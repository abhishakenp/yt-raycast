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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col gap-6 rounded-xl border bg-card p-8',
                  tier.highlighted
                    ? 'border-2 border-primary shadow-lg'
                    : 'border-border',
                )}
              >
                {tier.highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    {tier.period ? (
                      <span className="text-sm text-muted-foreground">
                        {tier.period}
                      </span>
                    ) : null}
                  </div>
                </div>
                {tier.features?.length ? (
                  <ul className="flex flex-col gap-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <svg
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 13 4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={tier.ctaTarget ?? tier.cta ?? 'Get started'}
                  plan={tier.name}
                  source="pricing"
                  aria-label={`${tier.cta ?? 'Get started'} for ${tier.name}`}
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
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
