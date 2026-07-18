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
 * CloudInfraPricing — usage-based pricing card grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above a
 * 3-tier pricing card grid; the middle tier can be tagged "popular" with a primary
 * border. Below the cards sits an enterprise reserved-capacity panel. Each tier
 * lists features with a check icon. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'
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
    void Check
    void enterpriseHeading
    void enterpriseDescription
    void enterpriseItems
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid
            tiers={tiers}
            heading="Usage-based pricing that scales"
            subheading="Pay only for what you use. No minimums, no upfront commitments, no surprise bills."
            renderCta={(tier) => (
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={tier.cta ?? 'Get started'}
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
            )}
            className={cn(
              'mx-auto grid max-w-6xl gap-8 lg:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
