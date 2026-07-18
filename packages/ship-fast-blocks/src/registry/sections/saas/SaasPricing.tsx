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
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

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
          <PricingGrid
            tiers={tiers}
            heading="Pricing that scales with you"
            subheading="Start free and upgrade when you"
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
        </Container>
      </section>
    )
  },
})
