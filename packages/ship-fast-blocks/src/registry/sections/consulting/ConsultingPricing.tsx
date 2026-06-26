import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ConsultingPricing — 3-tier engagement-models pricing block for a
 * management-consulting firm page. A centered heading and lead paragraph above
 * a responsive 3-column grid of tier cards; the middle tier can be featured
 * (dark primary card with a badge). Each tier includes name, price, unit,
 * description, a feature list with check icons, and a CTA button. All CTAs
 * route through useNavigate. Use for pricing, service tiers, or engagement
 * models on consulting, advisory, or professional-services sites. Renders fully
 * with no props via three baked-in default tiers.
 */
export const ConsultingPricing = defineComponent({
  name: 'ConsultingPricing',
  description:
    '3-tier engagement-models pricing block for a management-consulting firm page: a centered heading and lead paragraph above a responsive 3-column grid of tier cards, with an optional featured middle tier (dark primary card with a badge). Each tier shows name, price, unit, description, a feature list with check icons, and a CTA button. All CTAs route through useNavigate. Use for pricing, service tiers, or engagement models on consulting, advisory, or professional-services sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          unit: z.string().optional(),
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
    const heading = props.heading ?? 'Engagement Models'
    const description =
      props.description ??
      'Flexible approaches tailored to your unique challenges, timeline, and organizational needs.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Strategic Advisory',
            price: '$45K',
            unit: '/month',
            description:
              'Ideal for executive-level guidance on strategic direction, market entry, or transformation planning. Includes weekly advisory sessions and strategic roadmapping.',
            features: [
              'Monthly strategy sessions',
              'Executive coaching',
              'Market intelligence reports',
            ],
            cta: 'Learn More',
          },
          {
            name: 'Transformation Partnership',
            price: 'Custom',
            description:
              'Comprehensive support for major transformation initiatives. Dedicated team embedded with your organization for strategy through implementation.',
            features: [
              'Dedicated project team',
              'Full implementation support',
              'Change management',
              'Capability building',
            ],
            cta: 'Schedule Consultation',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Capability Building',
            price: '$85K',
            unit: '/program',
            description:
              'Intensive training and development programs to build internal consulting capabilities and leadership skills within your organization.',
            features: [
              'Workshop-based training',
              'Real project application',
              '12-week program duration',
            ],
            cta: 'Learn More',
          },
        ]

    const CheckIcon = ({ className }: { className?: string }) => (
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
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted',
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <h3
                  className={cn(
                    'mb-2 text-xl font-semibold',
                    tier.featured
                      ? 'text-primary-foreground'
                      : 'text-foreground',
                  )}
                >
                  {tier.name}
                </h3>
                <div className="mb-6">
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      tier.featured
                        ? 'text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {tier.price}
                  </span>
                  {tier.unit && (
                    <span
                      className={cn(
                        tier.featured
                          ? 'text-primary-foreground/60'
                          : 'text-muted-foreground',
                      )}
                    >
                      {tier.unit}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'mb-6 text-sm',
                    tier.featured
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.description}
                </p>
                <ul
                  className={cn(
                    'mb-8 space-y-3 text-sm',
                    tier.featured
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon
                        className={cn(
                          'mt-0.5 size-5 flex-shrink-0',
                          tier.featured
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground',
                        )}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.cta)}
                  className={cn(
                    'w-full rounded-md px-4 py-3 font-medium transition-colors',
                    tier.featured
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'border border-border bg-background text-foreground hover:bg-muted',
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
