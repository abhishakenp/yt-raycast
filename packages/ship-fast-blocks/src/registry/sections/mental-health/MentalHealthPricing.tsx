import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierTagline,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

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
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            align="center"
            eyebrowClassName="text-primary tracking-wider"
            subtitleClassName="leading-relaxed"
            className="mx-auto mb-16 max-w-2xl"
          />

          <PricingGrid className={cn('mx-auto max-w-5xl', props.className)}>
            <SectionHeading
              title={'Transparent pricing'}
              subtitle={
                'We believe mental health care should be accessible. We accept most major insurance plans and offer sliding scale options.'
              }
            />
            {tiers.map((tier) => {
              const t = tier as {
                name: string
                price: string
                features?: string[]
                cta?: string
                ctaTarget?: string
                tagline?: string
                blurb?: string
                description?: string
                audience?: string
                period?: string
                unit?: string
                cadence?: string
                suffix?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                badge?: string
                popularLabel?: string
                excluded?: string[]
                annual?: string
                priceSuffix?: string
                note?: string
              }
              return (
                <PricingTier
                  key={t.name}
                  variant={
                    t.highlighted || t.featured || t.popular
                      ? 'highlighted'
                      : undefined
                  }
                >
                  {t.highlighted || t.featured || t.popular ? (
                    <PricingTierBadge>{t.badge ?? 'Popular'}</PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName>{t.name}</PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline>{t.tagline}</PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline>{t.blurb}</PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline>{t.description}</PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline>{t.audience}</PricingTierTagline>
                    )}
                    <PricingTierPrice>{t.price}</PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod>{t.period}</PricingTierPeriod>
                    )}
                    {t.unit && <PricingTierPeriod>{t.unit}</PricingTierPeriod>}
                    {t.cadence && (
                      <PricingTierPeriod>{t.cadence}</PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod>{t.suffix}</PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures>
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <PricingTierCta target={t.ctaTarget}>
                      {t.cta}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
