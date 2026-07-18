import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ConstructionPricing — three-tier pricing table for a construction / general
 * contractor page. A centered section heading above a responsive 3-column
 * grid of pricing cards with a "Most Popular" highlight on the featured tier.
 * Each card lists features with check icons and a CTA button that routes
 * through useNavigate. Use to present transparent project pricing for
 * construction firms, contractors, builders, or remodeling companies.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
export const ConstructionPricing = defineCapsule({
  name: 'ConstructionPricing',
  description:
    "Three-tier pricing table for a construction / general contractor page: a centered section heading above a responsive 3-column grid of pricing cards with a 'Most Popular' highlight on the featured tier. Each card lists features with check icons and a CTA button that routes through useNavigate. Use to present transparent project pricing for construction firms, contractors, builders, or remodeling companies.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** CTA button label on each tier. */
    cta: z.string().optional(),
    /** Label for the featured "Most Popular" badge. */
    popularLabel: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          priceSuffix: z.string(),
          note: z.string(),
          features: z.array(z.string()),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Transparent pricing for every project'
    const description =
      props.description ??
      'Every project is unique. Here are typical starting points for our most common project types. Final pricing depends on scope, materials, and timeline.'
    const cta = props.cta ?? 'Get estimate'
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Kitchen Remodel',
            price: '$45K',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Cabinet replacement',
              'Countertop installation',
              'Flooring & lighting',
              '6-8 week timeline',
            ],
          },
          {
            name: 'Custom Home',
            price: '$650K',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Complete design-build',
              '3,000-5,000 sq ft',
              'Premium finishes',
              '12-18 month timeline',
            ],
            featured: true,
          },
          {
            name: 'Commercial Build',
            price: '$2M',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Turnkey delivery',
              '20,000+ sq ft',
              'LEED certification available',
              '18-36 month timeline',
            ],
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
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
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="text-sm tracking-wider text-muted-foreground"
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-xl p-8',
                  tier.featured
                    ? 'bg-foreground shadow-lg'
                    : 'bg-card shadow-sm',
                )}
              >
                {tier.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                      {popularLabel}
                    </span>
                  </div>
                ) : null}
                <h3
                  className={cn(
                    'mb-2 text-lg font-semibold',
                    tier.featured ? 'text-background' : 'text-foreground',
                  )}
                >
                  {tier.name}
                </h3>
                <div
                  className={cn(
                    'mb-1 text-4xl font-bold',
                    tier.featured ? 'text-background' : 'text-foreground',
                  )}
                >
                  {tier.price}
                  <span
                    className={cn(
                      'text-lg font-normal',
                      tier.featured
                        ? 'text-background/60'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.priceSuffix}
                  </span>
                </div>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    tier.featured
                      ? 'text-background/60'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.note}
                </p>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        'flex items-start gap-3 text-sm',
                        tier.featured
                          ? 'text-background/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Check className="shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(`${cta} — ${tier.name}`)}
                  className={cn(
                    'block w-full rounded-lg py-3 text-center font-semibold transition-colors',
                    tier.featured
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'bg-muted text-foreground hover:bg-accent',
                  )}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
