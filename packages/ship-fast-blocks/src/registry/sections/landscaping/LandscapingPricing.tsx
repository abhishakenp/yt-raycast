import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LandscapingPricing — a centered-header 3-tier maintenance pricing section for a
 * landscaping / outdoor-design company on a warm stone band. A heading +
 * description introduce three rounded plan cards (name, audience, big price +
 * period, a check-listed feature set, and a full-width CTA button); the featured
 * middle plan inverts to a solid primary surface, lifts slightly, and carries a
 * corner "POPULAR" badge. Check marks, prices and buttons recolor for the
 * featured plan. Calm, organic and premium with a sage-green accent. CTAs route
 * through useNavigate. Use for recurring care / maintenance plans for landscapers,
 * lawn-care services or grounds-keeping companies. Renders fully with no props
 * via baked-in three-tier defaults.
 */
export const LandscapingPricing = defineComponent({
  name: 'LandscapingPricing',
  description:
    'Centered-header 3-tier maintenance pricing section for a landscaping / outdoor-design company on a warm stone band: a heading + description introduce three rounded plan cards (name, audience, big price + period, a check-listed feature set, and a full-width CTA button); the featured middle plan inverts to a solid primary surface, lifts slightly, and carries a corner POPULAR badge, with check marks, prices and buttons recoloring for the featured plan. Calm, organic and premium with a sage-green accent; CTAs route through useNavigate. Use for recurring care / maintenance plans for landscapers, lawn-care services, garden designers or grounds-keeping companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          audience: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          badge: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Maintenance plans'
    const description =
      props.description ??
      'Predictable pricing for ongoing care. All plans include scheduling flexibility and dedicated crew assignment.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential Care',
            audience: 'For compact properties under 5,000 sq ft',
            price: '$285',
            period: '/month',
            features: [
              'Bi-weekly mowing and edging',
              'Seasonal fertilization (4x/year)',
              'Spring and fall cleanup',
              'Weed control in beds',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Complete Care',
            audience: 'For standard residential properties',
            price: '$495',
            period: '/month',
            features: [
              'Weekly mowing and edging',
              'Full pruning and shaping',
              'Monthly health inspections',
              'Irrigation monitoring',
              'Priority scheduling',
            ],
            cta: 'Get Started',
            badge: 'POPULAR',
            featured: true,
          },
          {
            name: 'Estate Care',
            audience: 'For properties 1+ acres or complex gardens',
            price: 'Custom',
            features: [
              'Multiple weekly visits',
              'Dedicated garden specialist',
              'Seasonal color rotation',
              'Hardscape maintenance',
              '24-hour response guarantee',
            ],
            cta: 'Contact Us',
          },
        ]

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('mt-0.5 size-5 flex-shrink-0', className)}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-xl p-8',
                  plan.featured
                    ? 'bg-primary text-primary-foreground shadow-lg md:-mt-4 md:mb-4'
                    : 'bg-card text-card-foreground shadow-sm',
                )}
              >
                {plan.badge && (
                  <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-chart-4 px-3 py-1 text-xs font-bold text-foreground">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={cn(
                      'mb-2 text-lg font-semibold',
                      plan.featured
                        ? 'text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      plan.featured
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {plan.audience}
                  </p>
                </div>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.featured
                        ? 'text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {plan.price}
                  </span>
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
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        'flex items-start gap-3',
                        plan.featured
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      <CheckIcon
                        className={
                          plan.featured
                            ? 'text-primary-foreground/70'
                            : 'text-primary'
                        }
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(plan.cta)}
                  className={cn(
                    'block w-full rounded-lg px-6 py-3 text-center font-medium transition-colors',
                    plan.featured
                      ? 'bg-background text-primary hover:bg-muted'
                      : 'bg-muted text-primary hover:bg-accent',
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
