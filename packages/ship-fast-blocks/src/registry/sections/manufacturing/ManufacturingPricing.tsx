import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ManufacturingPricing — a 3-tier pricing block for a precision-manufacturing
 * site. A centered eyebrow + heading + description intro sits above a three-
 * column card row; the featured tier inverts to a foreground surface and carries
 * a centered "Most Popular" badge, each card showing a name, blurb, price (with
 * optional /hr unit), a checklist of features and a full-width CTA routed
 * through useNavigate. Clean, neutral, transparent. Use to present
 * prototype/low-volume/production pricing on machine-shop or contract-
 * manufacturer pages. Renders fully with no props via baked-in defaults.
 */
export const ManufacturingPricing = defineCapsule({
  name: 'ManufacturingPricing',
  description:
    "A 3-tier pricing block for a precision-manufacturing site: a centered eyebrow + heading + description intro above a three-column card row; the featured tier inverts to a foreground surface and carries a centered 'Most Popular' badge, each card showing a name, blurb, price (with optional /hr unit), a checklist of features and a full-width CTA routed through useNavigate. Clean, neutral, transparent. Use to present prototype/low-volume/production pricing on machine-shop or contract-manufacturer pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          unit: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Transparent Pricing for Every Stage'
    const description =
      props.description ??
      'No hidden fees. Volume discounts apply. All quotes include material, machining, inspection, and standard packaging.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Prototypes',
            blurb: '1-10 parts for testing and validation',
            price: '$95',
            unit: '/hr',
            features: [
              '2-3 day turnaround',
              'Material certs included',
              'DFM feedback',
              'Photo documentation',
            ],
            cta: 'Get Prototype Quote',
          },
          {
            name: 'Low-Volume',
            blurb: '11-100 parts for pilot runs',
            price: '$75',
            unit: '/hr',
            features: [
              '1-2 week turnaround',
              'FAIR documentation',
              'PPAP Level 3 available',
              'CMM inspection reports',
              'Priority scheduling',
            ],
            cta: 'Get Quote',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Production',
            blurb: '100+ parts with volume pricing',
            price: 'Custom',
            features: [
              'Dedicated work cells',
              'Blanket orders accepted',
              'Kanban programs',
              'Annual pricing agreements',
            ],
            cta: 'Contact Sales',
          },
        ]

    const Check = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => {
              const featured = tier.featured ?? false
              return (
                <article
                  key={tier.name}
                  className={cn(
                    'relative rounded-lg border p-6',
                    featured
                      ? 'border-border bg-foreground'
                      : 'border-border bg-muted',
                  )}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                      {tier.badge}
                    </div>
                  )}
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      featured ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 text-sm',
                      featured ? 'text-background/70' : 'text-muted-foreground',
                    )}
                  >
                    {tier.blurb}
                  </p>
                  <p
                    className={cn(
                      'mt-4 text-3xl font-semibold',
                      featured ? 'text-background' : 'text-foreground',
                    )}
                  >
                    {tier.price}
                    {tier.unit && (
                      <span
                        className={cn(
                          'text-base font-normal',
                          featured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {tier.unit}
                      </span>
                    )}
                  </p>
                  <ul
                    className={cn(
                      'mt-6 space-y-3 text-sm',
                      featured ? 'text-background/80' : 'text-muted-foreground',
                    )}
                  >
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span
                          className={
                            featured ? 'text-background' : 'text-chart-2'
                          }
                        >
                          <Check />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(tier.cta)}
                    className={cn(
                      'mt-6 w-full rounded-md py-2.5 font-medium transition-colors',
                      featured
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : 'border border-border text-foreground hover:bg-accent',
                    )}
                  >
                    {tier.cta}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
