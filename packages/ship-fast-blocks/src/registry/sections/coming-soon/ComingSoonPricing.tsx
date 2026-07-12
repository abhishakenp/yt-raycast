import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ComingSoonPricing — three-tier pricing table for a "launching soon" / waitlist
 * pre-launch landing page. A centered heading and lead paragraph above a
 * responsive 1/3-column grid of plan cards: each shows the plan name, tagline,
 * price + period, a feature checklist with check icons, and a CTA button. The
 * "featured" plan gets a primary-colored background, shadow, and a floating badge.
 * All CTA buttons route through useNavigate. Use as the pricing / plans section
 * on SaaS waitlists, app pre-launch pages, or beta sign-up landers. Renders fully
 * with no props via three baked-in default plans.
 */
export const ComingSoonPricing = defineCapsule({
  name: 'ComingSoonPricing',
  description:
    "Three-tier pricing table for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead above a responsive 1/3-column grid of plan cards with name, tagline, price + period, feature checklist with check icons, and a CTA button. The featured plan gets a primary-colored background, shadow, and floating badge. CTAs route through useNavigate. Use as the pricing / plans section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
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
      'Choose the plan that fits your team. All plans include a 14-day free trial.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'For small teams getting started',
            price: '$0',
            period: '/month',
            features: [
              'Up to 5 team members',
              '10GB storage',
              'Basic integrations',
              'Community support',
            ],
            cta: 'Get started free',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For growing teams',
            price: '$12',
            period: '/user/month',
            features: [
              'Unlimited team members',
              '100GB storage',
              'Advanced integrations',
              'Priority support',
              'Analytics dashboard',
            ],
            cta: 'Start 14-day trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            tagline: 'For large organizations',
            price: '$49',
            period: '/user/month',
            features: [
              'Everything in Pro',
              'Unlimited storage',
              'SSO & SCIM',
              'Custom contracts',
              'Dedicated success manager',
            ],
            cta: 'Contact sales',
            featured: false,
          },
        ]

    const Check = ({ className }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          'w-full px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="font-light text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl p-8',
                  plan.featured
                    ? 'border border-primary bg-primary text-primary-foreground shadow-lg'
                    : 'border border-border bg-card text-card-foreground shadow-sm',
                )}
              >
                {plan.featured && plan.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-card-foreground">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}
                <h3
                  className={cn(
                    'mb-2 text-lg font-medium',
                    plan.featured
                      ? 'text-primary-foreground'
                      : 'text-card-foreground',
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    plan.featured
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.tagline}
                </p>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-light',
                      plan.featured
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.featured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-3" role="list">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        'flex items-start gap-3 text-sm',
                        plan.featured
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-0.5',
                          plan.featured
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground/60',
                        )}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    plan.featured
                      ? 'bg-card text-card-foreground hover:bg-muted'
                      : 'border border-input text-muted-foreground hover:border-foreground hover:text-foreground',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
