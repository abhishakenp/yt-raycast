import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * MentalHealthPricing — a transparent 3-tier pricing block for a therapy
 * practice. A centered eyebrow + heading + intro above a 3-column grid of pricing
 * cards; the "most popular" tier is lifted with a primary border, raised card
 * surface and a floating "Most Popular" badge, while others sit on a muted
 * surface. Each card shows name, cadence, big price + unit, a checkmarked feature
 * list, and a rounded booking button, with a centered sliding-scale note below.
 * Calm, reassuring wellness aesthetic. Buttons route through useNavigate. Use to
 * present session rates for therapists, counselors, psychologists or psychiatry.
 */
export const MentalHealthPricing = defineCapsule({
  name: 'MentalHealthPricing',
  description:
    "Transparent 3-tier pricing block for a therapy practice: a centered eyebrow + heading + intro above a 3-column grid of pricing cards; the 'most popular' tier is lifted with a primary border, raised card surface and a floating badge, while others sit on a muted surface. Each card shows name, cadence, big price + unit, a checkmarked feature list, and a rounded booking button, with a centered sliding-scale note below. Calm, reassuring wellness aesthetic. Buttons route through useNavigate. Use to present session rates for therapists, counselors, psychologists or psychiatry.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          cadence: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    note: z.string().optional(),
    /** Navigation target for the tier booking buttons (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Investment in You'
    const heading = props.heading ?? 'Transparent pricing'
    const description =
      props.description ??
      'We believe mental health care should be accessible. We accept most major insurance plans and offer sliding scale options.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Individual Therapy',
            cadence: '50-minute session',
            price: '$175',
            unit: '/session',
            features: [
              'Licensed therapist',
              'In-person or virtual',
              'Insurance billing included',
              'Between-session messaging',
            ],
            cta: 'Book Individual',
            popular: false,
          },
          {
            name: 'Couples Therapy',
            cadence: '80-minute session',
            price: '$250',
            unit: '/session',
            features: [
              'Gottman-trained therapist',
              'Extended 80-minute format',
              'Relationship assessment tools',
              'Homework & resources included',
            ],
            cta: 'Book Couples',
            popular: true,
          },
          {
            name: 'Psychiatry',
            cadence: 'Medication management',
            price: '$350',
            unit: '/initial',
            features: [
              'Board-certified psychiatrist',
              '60-minute initial evaluation',
              'Follow-ups: $175 (30 min)',
              'Prescription management',
            ],
            cta: 'Book Psychiatry',
            popular: false,
          },
        ]
    useSyncLocalServices(
      lakebed,
      tiers.map((tier) =>
        localServiceItem({
          name: tier.name,
          price: `${tier.price}${tier.unit}`,
          summary: tier.cadence,
        }),
      ),
    )
    const note =
      props.note ??
      'Sliding scale available: We reserve a limited number of reduced-rate slots for clients experiencing financial hardship. Contact us to inquire about availability.'
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative rounded-2xl p-8',
                  tier.popular
                    ? 'border-2 border-primary bg-card shadow-xl'
                    : 'border border-border bg-muted/50',
                )}
              >
                {tier.popular ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                ) : null}
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {tier.cadence}
                </p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground">{tier.unit}</span>
                </div>
                <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={tier.cta}
                  service={tier.name}
                  source="pricing"
                  pendingChildren={
                    <LocalServiceMutationSpinner
                      className={
                        tier.popular ? 'text-primary-foreground' : undefined
                      }
                    />
                  }
                  className={cn(
                    'block w-full rounded-full px-6 py-3 text-center font-medium transition-colors',
                    tier.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    'disabled:pointer-events-none disabled:opacity-70',
                  )}
                >
                  {tier.cta}
                </LocalServiceBookingButton>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
      </section>
    )
  },
})
