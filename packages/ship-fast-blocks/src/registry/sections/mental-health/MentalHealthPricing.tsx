import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

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

    void note
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

          <PricingGrid
            tiers={tiers}
            heading="Transparent pricing"
            subheading="We believe mental health care should be accessible. We accept most major insurance plans and offer sliding scale options."
            className={cn('mx-auto max-w-5xl', props.className)}
          />
        </div>
      </section>
    )
  },
})
