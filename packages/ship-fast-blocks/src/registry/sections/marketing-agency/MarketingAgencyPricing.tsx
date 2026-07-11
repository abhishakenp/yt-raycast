import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MarketingAgencyPricing — a 3-tier pricing table. A centered eyebrow + heading +
 * description above a responsive 3-up grid of plan cards, each with a name,
 * audience line, large price + period, a feature list (included rows get a primary
 * check, excluded rows render muted/struck with a cross), and a rounded pill CTA;
 * the featured plan inverts to the primary surface and shows a floating "Most
 * Popular" badge, with a reassurance note centered below. Links route through
 * useNavigate. Use to present retainer / service tiers for a marketing agency.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const MarketingAgencyPricing = defineCapsule({
  name: 'MarketingAgencyPricing',
  description:
    "3-tier pricing table: a centered eyebrow + heading + description above a responsive 3-up grid of plan cards, each with a name, audience line, large price + period, a feature list (included rows get a primary check, excluded rows render muted/struck with a cross), and a rounded pill CTA; the featured plan inverts to the primary surface and shows a floating 'Most Popular' badge, with a reassurance note centered below. Links route through useNavigate. Use to present retainer / service tiers for a marketing or growth agency.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    note: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          audience: z.string(),
          price: z.string(),
          period: z.string().optional(),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
          /** Features with `included: false` rendered struck/muted. */
          features: z.array(
            z.object({
              label: z.string(),
              included: z.boolean(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Simple, Transparent Pricing'
    const description =
      props.description ??
      'No hidden fees. No long-term contracts. Cancel anytime.'
    const note =
      props.note ??
      'All plans include a 30-day money-back guarantee. No questions asked.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            audience: 'For early-stage startups',
            price: '$3,500',
            period: '/month',
            cta: 'Get Started',
            featured: false,
            features: [
              {
                label: '1 channel (SEO or Paid)',
                included: true,
              },
              {
                label: 'Monthly reporting',
                included: true,
              },
              {
                label: 'Email support',
                included: true,
              },
              {
                label: '$10K monthly ad spend',
                included: true,
              },
              {
                label: 'CRO & landing pages',
                included: false,
              },
              {
                label: 'Dedicated strategist',
                included: false,
              },
            ],
          },
          {
            name: 'Growth',
            audience: 'For scaling companies',
            price: '$7,500',
            period: '/month',
            cta: 'Get Started',
            featured: true,
            badge: 'Most Popular',
            features: [
              {
                label: '3 channels included',
                included: true,
              },
              {
                label: 'Weekly reporting',
                included: true,
              },
              {
                label: 'Priority support',
                included: true,
              },
              {
                label: '$50K monthly ad spend',
                included: true,
              },
              {
                label: 'CRO & landing pages',
                included: true,
              },
              {
                label: 'Dedicated strategist',
                included: true,
              },
            ],
          },
          {
            name: 'Enterprise',
            audience: 'For established brands',
            price: 'Custom',
            cta: 'Contact Sales',
            featured: false,
            features: [
              {
                label: 'All channels included',
                included: true,
              },
              {
                label: 'Real-time dashboard',
                included: true,
              },
              {
                label: '24/7 support',
                included: true,
              },
              {
                label: 'Unlimited ad spend',
                included: true,
              },
              {
                label: 'Full creative team',
                included: true,
              },
              {
                label: 'Quarterly business reviews',
                included: true,
              },
            ],
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
    const Cross = ({ className }: { className?: string }) => (
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
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl p-8',
                  plan.featured
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-card-foreground',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      plan.featured
                        ? 'text-primary-foreground'
                        : 'text-card-foreground',
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      plan.featured
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.audience}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={cn(
                        plan.featured
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li
                      key={f.label}
                      className={cn(
                        'flex items-center gap-3',
                        f.included
                          ? plan.featured
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground'
                          : 'text-muted-foreground/50',
                      )}
                    >
                      {f.included ? (
                        <Check
                          className={cn(
                            'size-5 shrink-0',
                            plan.featured
                              ? 'text-primary-foreground'
                              : 'text-primary',
                          )}
                        />
                      ) : (
                        <Cross className="size-5 shrink-0" />
                      )}
                      {f.label}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'block w-full rounded-full py-3 text-center font-medium transition-colors',
                    plan.featured
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-border text-foreground hover:border-foreground/40',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {note}
          </p>
        </Container>
      </section>
    )
  },
})
