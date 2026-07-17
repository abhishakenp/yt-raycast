import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AeoPricing — three-tier pricing for an Answer-Engine-Optimization (AEO) SaaS.
 * Thin configuration over the shared PricingGrid composite: a centered heading
 * block above Starter, Growth (highlighted as "Most popular"), and Enterprise
 * tiers, each with a monthly price, a feature list, and a routable CTA. Use to
 * convert prospects on AEO, generative-search visibility, or brand-citation
 * analytics pages. Renders fully with no props via baked-in defaults.
 */
export const AeoPricing = defineCapsule({
  name: 'AeoPricing',
  description:
    "Three-tier pricing for an Answer-Engine-Optimization (AEO) product backed by shared Lakebed conversion state: a centered heading block above Starter, Growth (highlighted as 'Most popular'), and Enterprise tiers, each with a monthly price/period, feature list, and scoped fullstack CTA. Plans seed the command search catalog and selected tiers update shared conversion state. Use to convert prospects on AEO, generative-search visibility, or brand-citation analytics landing pages.",
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$49',
            period: '/mo',
            features: [
              '1 brand, 50 tracked prompts',
              'ChatGPT & Perplexity tracking',
              'Weekly citation reports',
              'Core optimization recommendations',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
          },
          {
            name: 'Growth',
            price: '$199',
            period: '/mo',
            features: [
              '3 brands, 500 tracked prompts',
              'All answer engines incl. AI Overviews',
              'Share-of-voice & competitor tracking',
              'Change alerts & prompt opportunities',
              'Priority support',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited brands & prompts',
              'API access & data exports',
              'Dedicated strategist & SSO',
              'Custom integrations & SLAs',
              'Executive reporting',
            ],
            cta: 'Book demo',
            ctaTarget: 'Book demo',
          },
        ]
    const heading =
      props.heading ?? 'Pricing that scales with your AI visibility'
    const subheading =
      props.subheading ??
      'Start free, then upgrade as you track more prompts, brands, and answer engines. No setup fees.'

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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
            titleClassName="tracking-tight"
            subtitleClassName="leading-7"
            className="mx-auto max-w-3xl"
          />

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col rounded-xl border bg-card p-8 text-card-foreground',
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
                <h3 className="text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  {tier.period ? (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  ) : null}
                </div>
                {tier.features?.length ? (
                  <ul className="mt-7 flex flex-col gap-3">
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
                  intentLabel={tier.ctaTarget ?? tier.cta ?? 'Start Free'}
                  plan={tier.name}
                  source="pricing"
                  aria-label={`${tier.cta ?? 'Start Free'} for ${tier.name}`}
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Selecting
                    </>
                  }
                  className={cn(
                    'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                    tier.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {tier.cta ?? 'Start Free'}
                </SaasPlanActionButton>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
