import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * MarketingPricing — a centered-header 3-tier pricing table for a SaaS /
 * product-marketing landing page. Thin configuration over the shared `PricingGrid`
 * composite: a bold heading + supporting line over a responsive grid of bordered
 * plan cards — name, big price + period, a checkmarked feature list, and a
 * full-width CTA; the "most popular" plan gets a primary ring + a floating
 * "Most popular" badge and a filled CTA. CTAs route through useNavigate. Use as
 * the pricing section for B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingPricing = defineCapsule({
  name: 'MarketingPricing',
  description:
    "Centered-header 3-tier pricing table for a SaaS / product-marketing landing page: a bold heading + supporting line over a responsive 1/2/3-column grid of bordered plan cards (name, big price + period, description, a checkmarked feature list, and a full-width CTA); the 'most popular' plan gets a primary ring, a floating 'most popular' badge and a filled CTA, and cards lift slightly on hover. Clean premium indigo-on-light aesthetic; CTAs route through useNavigate. Use as the pricing section for B2B SaaS, productivity, or developer-platform pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    /** Label on the badge over the highlighted plan. */
    popularLabel: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            description: 'Perfect for personal projects and small experiments.',
            price: '$0',
            period: '/mo',
            features: [
              'Up to 3 projects',
              'Basic task boards',
              'Community support',
            ],
            cta: 'Get started free',
            popular: false,
          },
          {
            name: 'Pro',
            description: 'For growing teams that need power and flexibility.',
            price: '$12',
            period: '/user/mo',
            features: [
              'Unlimited projects',
              'Advanced analytics',
              'Automated workflows',
              'Priority support',
            ],
            cta: 'Start free trial',
            popular: true,
          },
          {
            name: 'Enterprise',
            description:
              'For organizations with advanced security and scale needs.',
            price: 'Custom',
            period: '',
            features: [
              'SSO & SCIM provisioning',
              'Dedicated success manager',
              'Custom contracts & SLA',
            ],
            cta: 'Contact sales',
            popular: false,
          },
        ]

    return (
      <section className={cn('py-20', props.className)}>
        <div className="mx-auto max-w-6xl px-6">
          <PricingGrid
            heading={heading}
            subheading={description}
            tiers={plans.map((plan) => ({
              name: plan.name,
              price: plan.price,
              period: plan.period,
              features: plan.features,
              cta: plan.cta,
              highlighted: plan.popular,
            }))}
          />
        </div>
      </section>
    )
  },
})
