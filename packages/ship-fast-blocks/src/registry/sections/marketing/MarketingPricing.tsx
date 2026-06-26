import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MarketingPricing — a centered-header 3-tier pricing table for a SaaS /
 * product-marketing landing page. A bold heading + supporting line over a
 * responsive 1/2/3-column grid of bordered plan cards: name, big price +
 * period, description, a checkmarked feature list, and a full-width CTA; the
 * "most popular" plan gets a primary ring + a floating "Most popular" badge and
 * a filled CTA. Cards lift slightly on hover. Clean premium indigo-on-light
 * aesthetic; CTAs route through useNavigate. Use as the pricing section for B2B
 * SaaS, productivity, or developer-platform pages.
 */
export const MarketingPricing = defineComponent({
  name: 'MarketingPricing',
  description:
    "Centered-header 3-tier pricing table for a SaaS / product-marketing landing page: a bold heading + supporting line over a responsive 1/2/3-column grid of bordered plan cards (name, big price + period, description, a checkmarked feature list, and a full-width CTA); the 'most popular' plan gets a primary ring, a floating 'Most popular' badge and a filled CTA, and cards lift slightly on hover. Clean premium indigo-on-light aesthetic; CTAs route through useNavigate. Use as the pricing section for B2B SaaS, productivity, or developer-platform pages.",
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
    const go = useNavigate()
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const popularLabel = props.popularLabel ?? 'Most popular'
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

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    return (
      <section className={cn('py-20', props.className)}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]',
                  plan.popular
                    ? 'border-primary ring-1 ring-primary shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]'
                    : 'border-border',
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-primary-foreground">
                    {popularLabel}
                  </span>
                ) : null}
                <h3 className="text-lg font-bold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span className="text-[0.95rem] font-medium text-muted-foreground">
                      {plan.period}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-[0.9rem] text-muted-foreground"
                    >
                      <Check />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                    plan.popular
                      ? 'bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:-translate-y-px hover:bg-primary/90'
                      : 'border border-border bg-muted/50 text-foreground hover:bg-muted',
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
