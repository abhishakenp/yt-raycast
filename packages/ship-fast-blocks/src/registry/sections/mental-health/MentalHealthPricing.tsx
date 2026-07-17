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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PricingCard,
  PricingCardBadge,
  PricingCardName,
  PricingCardTagline,
  PricingCardPrice,
  PricingCardPriceValue,
  PricingCardPriceUnit,
  PricingCardFeatures,
  PricingCardFeature,
  PricingCardCheckIcon,
  PricingCardCta,
} from '#/section-kit/PricingCard.tsx'

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

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            align="center"
            eyebrowClassName="text-primary tracking-wider"
            subtitleClassName="leading-relaxed"
            className="mx-auto mb-16 max-w-2xl"
          />

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <PricingCard
                key={tier.name}
                variant={tier.popular ? 'outlined-2xl' : 'muted-2xl'}
                highlight={tier.popular ? 'primary' : 'none'}
                className={tier.popular ? 'bg-card shadow-xl' : undefined}
              >
                {tier.popular ? (
                  <PricingCardBadge className="-top-4 px-4 py-1 text-sm">
                    Most Popular
                  </PricingCardBadge>
                ) : null}
                <PricingCardName className="mb-2">{tier.name}</PricingCardName>
                <PricingCardTagline className="mb-6">
                  {tier.cadence}
                </PricingCardTagline>
                <PricingCardPrice className="mt-0 mb-6">
                  <PricingCardPriceValue className="tracking-normal">
                    {tier.price}
                  </PricingCardPriceValue>
                  <PricingCardPriceUnit className="text-base">
                    {tier.unit}
                  </PricingCardPriceUnit>
                </PricingCardPrice>
                <PricingCardFeatures className="mt-0 block mb-8 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((f) => (
                    <PricingCardFeature key={f} className="gap-3">
                      <PricingCardCheckIcon className="size-5" />
                      <span>{f}</span>
                    </PricingCardFeature>
                  ))}
                </PricingCardFeatures>
                <PricingCardCta asChild className="mt-0">
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
                </PricingCardCta>
              </PricingCard>
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
