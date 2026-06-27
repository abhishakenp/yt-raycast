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

    return (
      <section className={cn('bg-muted/50 py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-2xl border p-8',
                  plan.featured
                    ? 'border-border bg-foreground text-background md:-translate-y-4'
                    : 'border-border bg-card text-card-foreground',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    {plan.badge}
                  </div>
                )}
                <h3
                  className={cn(
                    'mb-2 text-lg font-semibold',
                    plan.featured ? 'text-background' : 'text-card-foreground',
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    plan.featured
                      ? 'text-background/60'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.blurb}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={cn(
                        plan.featured
                          ? 'text-background/60'
                          : 'text-muted-foreground',
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul
                  className={cn(
                    'mb-8 space-y-3 text-sm',
                    plan.featured
                      ? 'text-background/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={plan.cta}
                  plan={plan.name}
                  source="pricing"
                  aria-label={`${plan.cta} for ${plan.name}`}
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Selecting
                    </>
                  }
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 text-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-70',
                    plan.featured
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-input text-foreground hover:bg-muted',
                  )}
                >
                  {plan.cta}
                </SaasPlanActionButton>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
