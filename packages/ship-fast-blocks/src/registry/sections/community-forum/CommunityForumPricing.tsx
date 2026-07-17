import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * CommunityForumPricing — 3-tier pricing table for a community-platform / discussion-forum
 * landing page. Thin configuration over the shared `PricingGrid` composite: a centered
 * heading + description above a responsive 3-column grid of pricing cards on a muted band;
 * one tier can be highlighted. Each card shows a name, price, cadence, feature list with
 * checkmarks, and a CTA button. All buttons route through useNavigate. Use as the pricing
 * section for SaaS community-platform products, subscription services, or membership tools.
 */
export const CommunityForumPricing = defineCapsule({
  name: 'CommunityForumPricing',
  description:
    '3-tier pricing table for a community-platform / discussion-forum landing page: a centered heading and description above a responsive 3-column grid of bordered pricing cards on a muted band, with one tier highlighted (dark foreground theme). Each card shows a badge, name, price, cadence, description, feature list with checkmarks, and a CTA button; all buttons route through useNavigate. Use as the pricing section for SaaS community-platform products, subscription services, or membership tools.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers: name, price, cadence, description, features, cta, featured flag, badge. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          cadence: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free and scale as your community grows. No hidden fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$0',
            cadence: 'Forever free',
            description:
              'Perfect for small groups getting started with community building.',
            features: [
              'Up to 100 members',
              '5 topic categories',
              'Basic analytics',
              'Community support',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Growth',
            price: '$49',
            cadence: 'per month',
            description:
              'For growing communities that need more power and flexibility.',
            features: [
              'Up to 5,000 members',
              'Unlimited categories',
              'Advanced analytics',
              'Priority email support',
              'Custom domain',
            ],
            cta: 'Start 14-Day Trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            price: '$299',
            cadence: 'per month',
            description:
              'For large organizations with advanced security and scaling needs.',
            features: [
              'Unlimited members',
              'SSO & SAML',
              'API access',
              'Dedicated support',
              'SLA guarantee',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]

    return (
      <section className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <PricingGrid
              heading={heading}
              subheading={description}
              tiers={tiers.map((tier) => ({
                name: tier.name,
                price: tier.price,
                period: tier.cadence,
                features: tier.features,
                cta: tier.cta,
                highlighted: tier.featured,
              }))}
            />
          </div>
        </div>
      </section>
    )
  },
})
