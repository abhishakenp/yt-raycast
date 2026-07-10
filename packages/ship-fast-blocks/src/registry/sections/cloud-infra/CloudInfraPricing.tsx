import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CloudInfraPricing — usage-based pricing card grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above a
 * 3-tier pricing card grid; the middle tier can be tagged "popular" with a primary
 * border. Below the cards sits an enterprise reserved-capacity panel. Each tier
 * lists features with a check icon. Tokens-only. Renders fully on zero arguments.
 */
export const CloudInfraPricing = defineCapsule({
  name: 'CloudInfraPricing',
  description:
    'Usage-based pricing card grid for a cloud-infrastructure / developer-platform SaaS landing page backed by shared Lakebed conversion state: a centered heading plus description above a 3-tier pricing card grid with scoped plan CTAs that seed command search and record conversion intent. Below the cards sits an enterprise reserved-capacity panel. Use for pricing sections on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers: name, tagline, price, unit, features, and optional popular flag. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string().optional(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    /** Enterprise panel heading. */
    enterpriseHeading: z.string().optional(),
    /** Enterprise panel description. */
    enterpriseDescription: z.string().optional(),
    /** Enterprise commitment items (e.g. '1-year: 15% discount'). */
    enterpriseItems: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Usage-based pricing that scales'
    const description =
      props.description ??
      'Pay only for what you use. No minimums, no upfront commitments, no surprise bills.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Compute',
            tagline: 'Virtual machines and containers',
            price: '$0.004',
            unit: '/ vCPU-hour',
            features: [
              'Shared CPU instances from 1 vCPU / 512 MB',
              'Dedicated CPU at $0.028/vCPU-hour',
              'GPU instances (NVIDIA A100) at $2.50/hour',
              'Auto-scaling with per-second billing',
            ],
            cta: 'Start Compute',
          },
          {
            name: 'Serverless',
            tagline: 'Functions and edge computing',
            price: '$0.15',
            unit: '/ million requests',
            popular: true,
            features: [
              'First 1M requests free every month',
              '$0.0001 per GB-second of compute',
              '128 MB to 8 GB memory tiers',
              'Global edge deployment included',
            ],
            cta: 'Start Free',
          },
          {
            name: 'Storage & Data',
            tagline: 'Databases, caches, and object storage',
            price: '$0.10',
            unit: '/ GB-month',
            features: [
              'Managed PostgreSQL and MySQL',
              'Redis cache from $15/month',
              'Object storage with free egress',
              'Automated daily backups included',
            ],
            cta: 'Start Storage',
          },
        ]
    const enterpriseHeading =
      props.enterpriseHeading ?? 'Enterprise commitments'
    const enterpriseDescription =
      props.enterpriseDescription ??
      'For predictable workloads, reserve capacity and save up to 40%. Annual commitments include dedicated support and custom SLAs.'
    const enterpriseItems = props.enterpriseItems?.length
      ? props.enterpriseItems
      : ['1-year: 15% discount', '2-year: 25% discount', '3-year: 40% discount']

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.unit,
          price: tier.price,
          summary: tier.tagline,
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
      <section className={cn('bg-muted/40 py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-xl bg-card p-8',
                  tier.popular
                    ? 'border-2 border-primary'
                    : 'border border-border',
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.tagline}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-semibold text-card-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground"> {tier.unit}</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-chart-2" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={tier.cta ?? `Start ${tier.name}`}
                  plan={tier.name}
                  source="pricing"
                  aria-label={`${tier.cta ?? `Start ${tier.name}`} for ${tier.name}`}
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Selecting
                    </>
                  }
                  className={cn(
                    'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                    tier.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border text-foreground hover:bg-muted',
                  )}
                >
                  {tier.cta ?? `Start ${tier.name}`}
                </SaasPlanActionButton>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <Card>
              <h4 className="mb-4 text-lg font-semibold text-card-foreground">
                {enterpriseHeading}
              </h4>
              <p className="mb-4 text-muted-foreground">
                {enterpriseDescription}
              </p>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                {enterpriseItems.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="size-5 text-chart-2" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    )
  },
})
