import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * KidsEducationPricing — friendly 3-tier pricing table for a kids / family
 * learning platform. A centered eyebrow + heading + description intro above a
 * responsive 3-up grid of rounded plan cards; the highlighted "Most Popular"
 * plan inverts to a dark surface, lifts on desktop, and shows a floating badge.
 * Each card lists name, tagline, price + period, a checkmarked feature list, and
 * a full-width pill CTA, with a reassurance note centered below. CTAs route
 * through useNavigate. Use for subscription tiers on kids-education startups,
 * children's e-learning platforms, tutoring services, and family learning apps.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const KidsEducationPricing = defineCapsule({
  name: 'KidsEducationPricing',
  description:
    "Friendly 3-tier pricing table for a kids / family learning platform: a centered eyebrow + heading + description intro above a responsive 3-up grid of rounded plan cards; the highlighted 'Most Popular' plan inverts to a dark surface, lifts on desktop, and shows a floating badge. Each card lists name, tagline, price + period, a checkmarked feature list, and a full-width pill CTA, with a reassurance note centered below. CTAs route through useNavigate. Use for subscription tiers on kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Reassurance note centered beneath the plans. */
    note: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          popularLabel: z.string().optional(),
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
      'Choose the plan that works for your family. All plans include a 14-day free trial.'
    const note =
      props.note ??
      'All plans include a 14-day free trial. No credit card required.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'Perfect for trying out',
            price: '$0',
            period: '/month',
            features: [
              '3 activities per day',
              '1 child profile',
              'Basic progress tracking',
              'Community support',
            ],
            cta: 'Get Started Free',
          },
          {
            name: 'Family',
            tagline: 'Best for growing families',
            price: '$12',
            period: '/month',
            features: [
              'Unlimited activities',
              'Up to 4 child profiles',
              'Detailed progress reports',
              'Offline activity downloads',
              'Priority email support',
            ],
            cta: 'Start Free Trial',
            popular: true,
            popularLabel: 'Most Popular',
          },
          {
            name: 'School',
            tagline: 'For classrooms & educators',
            price: '$49',
            period: '/month',
            features: [
              'Up to 30 student profiles',
              'Teacher dashboard',
              'Classroom management',
              'Dedicated account manager',
            ],
            cta: 'Contact Sales',
          },
        ]
    const CheckMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-3xl p-8',
                  plan.popular
                    ? 'bg-foreground text-background shadow-2xl md:-translate-y-4'
                    : 'border border-border bg-muted/40 transition-colors hover:border-foreground/20',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                      {plan.popularLabel ?? 'Most Popular'}
                    </span>
                  </div>
                )}
                <div className={cn('mb-6', plan.popular && 'pt-2')}>
                  <h3
                    className={cn(
                      'mb-2 text-xl font-bold',
                      plan.popular ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      plan.popular
                        ? 'text-background/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.tagline}
                  </p>
                </div>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.popular ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={cn(
                      plan.popular
                        ? 'text-background/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckMark
                        className={cn(
                          'mt-0.5 size-5 shrink-0',
                          plan.popular ? 'text-primary' : 'text-secondary',
                        )}
                      />
                      <span
                        className={cn(
                          plan.popular
                            ? 'text-background/90'
                            : 'text-muted-foreground',
                        )}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'block w-full rounded-full py-3 text-center font-semibold transition-colors',
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-2 border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">{note}</p>
          </div>
        </Container>
      </section>
    )
  },
})
