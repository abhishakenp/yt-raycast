import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CorporatePricing — transparent 3-tier pricing table for an enterprise / corporate
 * B2B site. A centered heading above a responsive 1/2/3-column grid of pricing
 * cards on a muted band; the middle card can be featured with an inverted dark
 * style and a floating "Most Popular" badge. Every card lists plan name, blurb,
 * price, a feature checklist, and a CTA button that routes through useNavigate.
 * Use for SaaS, managed services, or enterprise software pricing pages.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CorporatePricing = defineCapsule({
  name: 'CorporatePricing',
  description:
    "Transparent 3-tier pricing table for an enterprise / corporate B2B site: centered heading above a responsive 1/2/3-column grid of pricing cards on a muted band, with an optional featured dark middle card and a floating 'Most Popular' badge. Each card lists plan name, blurb, price, feature checklist, and a CTA button routing through useNavigate. Use for SaaS, managed services, or enterprise software pricing.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string().optional(),
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
    const heading = props.heading ?? 'Transparent enterprise pricing'
    const description =
      props.description ??
      'Flexible plans designed to scale with your organization. All plans include implementation support.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Professional',
            blurb: 'For growing teams up to 250 employees',
            price: '$2,500',
            period: '/month',
            features: [
              'Up to 5 cloud environments',
              '24/7 email and chat support',
              'Standard security features',
              'Basic analytics dashboard',
              'Quarterly business reviews',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Enterprise',
            blurb: 'For mid-size organizations up to 5,000 employees',
            price: '$8,500',
            period: '/month',
            features: [
              'Unlimited cloud environments',
              '24/7 phone, email & chat support',
              'Advanced security & compliance',
              'Custom analytics & AI insights',
              'Monthly business reviews',
              'Dedicated success manager',
            ],
            cta: 'Contact Sales',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Global',
            blurb: 'For large enterprises with 5,000+ employees',
            price: 'Custom',
            period: '',
            features: [
              'Everything in Enterprise',
              'Multi-region deployment',
              'Custom SLAs & contracts',
              'On-premise deployment options',
              'Executive advisory board access',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]
    const Check = ({ className }) => (
      <svg
        width="20"
        height="20"
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
      <section className={cn('bg-muted/50 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl border p-8',
                  plan.featured
                    ? 'border-foreground bg-foreground'
                    : 'border-border bg-background',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3
                  className={cn(
                    'mb-2 text-lg font-semibold',
                    plan.featured ? 'text-background' : 'text-foreground',
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    plan.featured
                      ? 'text-background/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.blurb}
                </p>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-semibold',
                      plan.featured ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={cn(
                        plan.featured
                          ? 'text-background/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          'mt-0.5 size-5 flex-shrink-0',
                          plan.featured
                            ? 'text-primary-foreground'
                            : 'text-primary',
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm',
                          plan.featured
                            ? 'text-background/80'
                            : 'text-muted-foreground',
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    plan.featured
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'bg-muted text-foreground hover:bg-accent',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
