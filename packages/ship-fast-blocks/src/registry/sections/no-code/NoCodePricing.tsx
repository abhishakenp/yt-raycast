import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
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
 * NoCodePricing — 3-tier pricing table on a subtle muted band. A centered header
 * (eyebrow, heading, paragraph) sits above a monthly/yearly toggle switch with a
 * "save" badge, then a 1-to-3 column grid of plan cards: the featured plan is
 * rendered on the inverse foreground surface with a floating "Most Popular"
 * badge, each card has a name, tagline, big price + period, a full-width CTA,
 * and a checkmarked feature list. Every CTA and the toggle route through
 * useNavigate. Use as the pricing section for a no-code builder, SaaS, or any
 * subscription product. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'
export const NoCodePricing = defineCapsule({
  name: 'NoCodePricing',
  description:
    '3-tier pricing table backed by shared Lakebed conversion state: a centered header above an interactive monthly/yearly toggle, then plan cards where CTAs have scoped mutation loading. Plans seed command search and every CTA records selected plan or sales intent. Use as the pricing section for a no-code / app-builder SaaS or any subscription product.',
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Monthly billing toggle label. */
    monthlyLabel: z.string().optional(),
    /** Yearly billing toggle label. */
    yearlyLabel: z.string().optional(),
    /** Savings badge shown beside the yearly label. */
    saveBadge: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
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
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const monthlyLabel = props.monthlyLabel ?? 'Monthly'
    const yearlyLabel = props.yearlyLabel ?? 'Yearly'
    const saveBadge = props.saveBadge ?? 'Save 20%'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'Perfect for side projects',
            price: '$0',
            period: '/month',
            cta: 'Start building free',
            features: [
              '3 projects',
              '50+ templates',
              'Buildr subdomain',
              'Community support',
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious creators',
            price: '$29',
            period: '/month',
            cta: 'Start 14-day trial',
            featured: true,
            badge: 'Most Popular',
            features: [
              'Unlimited projects',
              '200+ templates',
              'Custom domain',
              '10 team members',
              'Priority support',
              'Analytics dashboard',
            ],
          },
          {
            name: 'Enterprise',
            tagline: 'For large organizations',
            price: 'Custom',
            cta: 'Contact sales',
            features: [
              'Everything in Pro',
              'Unlimited team members',
              'SSO & advanced security',
              'Dedicated account manager',
              'Custom SLA',
            ],
          },
        ]
    const isYearly = billing === 'yearly'
    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.period,
          price: plan.price,
          summary: plan.tagline || plan.features.at(0) || '',
        }),
      ),
    )
    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
    void Check
    return (
      <section
        className={cn('bg-muted/40 py-24', props.className)}
        aria-labelledby="nc-pricing"
      >
        <Container>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-pricing"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">{description}</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-foreground">
                {monthlyLabel}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle yearly billing"
                onClick={() =>
                  setBilling((current) =>
                    current === 'monthly' ? 'yearly' : 'monthly',
                  )
                }
                className="relative h-8 w-14 rounded-full bg-foreground p-1"
              >
                <span
                  className={cn(
                    'block size-6 rounded-full bg-background shadow transition-transform',
                    isYearly ? 'translate-x-6' : 'translate-x-0',
                  )}
                />
              </button>
              <span className="text-sm font-medium text-muted-foreground">
                {yearlyLabel}
              </span>
              <span className="rounded-full bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
                {saveBadge}
              </span>
            </div>
          </div>
          <PricingGrid
            tiers={plans}
            heading="Simple, transparent pricing"
            subheading="Start free, scale as you grow. No hidden fees, no surprises."
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
            className={cn(
              'mx-auto grid max-w-6xl gap-8 md:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
