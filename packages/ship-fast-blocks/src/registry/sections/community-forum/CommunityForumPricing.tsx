import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CommunityForumPricing — 3-tier pricing table for a community-platform / discussion-forum
 * landing page. A centered heading + description above a responsive 3-column grid of bordered
 * pricing cards on a muted band; one tier can be highlighted (dark foreground theme). Each card
 * shows a badge, name, price, cadence, description, feature list with checkmarks, and a CTA button.
 * All buttons route through useNavigate. Use as the pricing section for SaaS community-platform
 * products, subscription services, or membership tools.
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
    const go = useNavigate()
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-xl border p-8',
                  tier.featured
                    ? 'border-foreground bg-foreground'
                    : 'border-border bg-card',
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {tier.badge}
                  </div>
                )}
                <div
                  className={cn(
                    'mb-2 text-sm font-medium',
                    tier.featured
                      ? 'text-background/60'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.name}
                </div>
                <div
                  className={cn(
                    'mb-2 text-4xl font-bold',
                    tier.featured ? 'text-background' : 'text-foreground',
                  )}
                >
                  {tier.price}
                </div>
                <div
                  className={cn(
                    'mb-6 text-sm',
                    tier.featured
                      ? 'text-background/60'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.cadence}
                </div>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    tier.featured
                      ? 'text-background/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.description}
                </p>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      className={cn(
                        'flex items-center gap-3 text-sm',
                        tier.featured
                          ? 'text-background/90'
                          : 'text-foreground/80',
                      )}
                    >
                      <Check className="size-5 shrink-0 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className={cn(
                    'block w-full rounded-lg py-3 text-center text-sm font-medium transition-colors',
                    tier.featured
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-input bg-card text-foreground/80 hover:bg-muted',
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
