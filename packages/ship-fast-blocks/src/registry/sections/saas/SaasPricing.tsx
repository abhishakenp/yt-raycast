import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasPricing — a 3-tier pricing band for a B2B SaaS landing page. Thin
 * configuration over the shared `PricingGrid` composite: a centered heading +
 * intro above a responsive 3-column grid of plan cards (name, big price +
 * period, checkmark feature bullets, and a CTA button). The highlighted tier
 * gets a primary border, shadow, and a floating "Most popular" pill, and every
 * CTA routes through useNavigate. Use to present subscription tiers for SaaS
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
                  intentLabel={tier.cta}
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
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
