import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BootcampPricing — 3-tier pricing / financing comparison for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description above
 * a responsive 3-column grid of plan cards; each card shows a name, blurb, price,
 * feature list with check-icon bullets, and a CTA button. One plan can be
 * highlighted with a primary border and a floating badge. A footnote row with a
 * clickable CTA link sits below the grid. Every interaction routes through
 * useNavigate. Use as the pricing table for bootcamps, academies, or vocational
 * programs offering multiple payment options.
 */
import { Container } from '#/section-kit/Container.tsx'
export const BootcampPricing = defineCapsule({
  name: 'BootcampPricing',
  description:
    '3-tier pricing / financing comparison for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 3-column grid of plan cards. Each card shows name, blurb, price, feature list with check-icon bullets, and a CTA button. One plan can be highlighted with a primary border and floating badge. A footnote row with a clickable CTA link sits below. All routes through useNavigate. Use as the pricing table for bootcamps, academies, or vocational programs offering multiple payment options.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans: name, description, price, unit, features, CTA, optional featured flag and badge. */
    items: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote text under the grid. */
    footnote: z.string().optional(),
    /** Clickable CTA link text in the footnote. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const pricingEyebrow = props.eyebrow ?? 'Investment'
    const pricingHeading = props.heading ?? 'Flexible payment options'
    const pricingDesc =
      props.description ??
      'Choose the plan that works for your financial situation. All options include the same curriculum and job guarantee.'
    const pricingItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Upfront Payment',
            blurb: 'Pay in full before the cohort starts',
            price: '$12,500',
            unit: 'one-time',
            features: [
              'Save $2,000 vs. other options',
              'No future payments',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
          },
          {
            name: 'Monthly Payment',
            blurb: 'Spread the cost over 12 months',
            price: '$1,125',
            unit: '/month',
            features: [
              '0% interest financing',
              'No credit check required',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Income Share',
            blurb: 'Pay nothing until you earn $50k+',
            price: '$0',
            unit: 'upfront',
            features: [
              '10% of income for 24 months',
              'Capped at $16,500 total',
              'Only pay if you succeed',
            ],
            cta: 'Select Plan',
          },
        ]
    const pricingFootnote =
      props.footnote ??
      'Scholarships available for underrepresented groups in tech.'
    const pricingFootnoteCta = props.footnoteCta ?? 'Learn more →'
    const Check = ({ className }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
              {pricingEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {pricingHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{pricingDesc}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {pricingItems.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-2xl bg-card p-8',
                  plan.featured
                    ? 'border-2 border-primary'
                    : 'border border-border',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </div>
                )}
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {plan.name}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {plan.blurb}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground"> {plan.unit}</span>
                </div>
                <ul className="mb-8 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(`${plan.name} ${plan.cta}`)}
                  className={cn(
                    'w-full rounded-lg py-3 font-medium transition-colors',
                    plan.featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border text-foreground hover:border-primary',
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {pricingFootnote}{' '}
            <button
              type="button"
              onClick={() => go(pricingFootnoteCta)}
              className="text-primary hover:underline"
            >
              {pricingFootnoteCta}
            </button>
          </p>
        </Container>
      </section>
    )
  },
})
