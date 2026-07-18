import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * DevToolPricing — a 3-tier pricing table for a developer tool / API platform.
 * A muted-banded section with a centered heading + intro above a responsive
 * 3-column grid of plan cards (name, tagline, big price + period, a checklist of
 * features with brand checkmarks, and a CTA button). The featured tier gets a
 * brand-colored border, shadow, and a floating "Most Popular" pill. Every CTA
 * routes through useNavigate. Use to present subscription tiers for developer
 * tools, API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolPricing = defineCapsule({
  name: 'DevToolPricing',
  description:
    "3-tier pricing table for a developer tool / API platform backed by shared Lakebed conversion state: a muted-banded section with a centered heading + intro above a responsive 3-column grid of plan cards. Plans seed the command search catalog; each CTA records scoped sign-up or sales intent with local loading. The featured tier gets a brand-colored border, shadow, and a floating 'Most Popular' pill. Use to present subscription tiers for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
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
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            tagline: 'For side projects and learning',
            price: '$0',
            period: '/month',
            features: [
              '10,000 API requests/month',
              '1 GB storage',
              'Community support',
              '3 team members',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For production applications',
            price: '$29',
            period: '/month',
            features: [
              '500,000 API requests/month',
              '50 GB storage',
              'Priority email support',
              '15 team members',
              'Custom domains & SSL',
            ],
            cta: 'Start Free Trial',
            featured: true,
          },
          {
            name: 'Enterprise',
            tagline: 'For large-scale teams',
            price: 'Custom',
            features: [
              'Unlimited API requests',
              'Unlimited storage',
              '24/7 phone & Slack support',
              'Unlimited team members',
              'SSO, audit logs, SLAs',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline,
        }),
      ),
    )

    const Check = () => (
      <svg
        className="mt-0.5 size-5 flex-shrink-0 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="5 13 9 17 19 7" />
      </svg>
    )

    void Check
    void popularLabel
    return (
      <section
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="pricing-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid
            tiers={tiers}
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
