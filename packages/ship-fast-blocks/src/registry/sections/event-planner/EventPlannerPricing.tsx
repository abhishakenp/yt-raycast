import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
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
 * EventPlannerPricing — three-tier planning-packages block on a muted band. A
 * centered intro (uppercase eyebrow, thin light heading, lede) above a 3-up grid
 * of rounded package cards; the "popular" tier is filled with the primary color
 * and lifted with a shadow plus a corner ribbon, while the others are plain cards.
 * Each card shows name, tagline, large light price, a check-marked feature list,
 * and a full-width pill CTA that records a real Lakebed pricing action. Use to
 * present tiered pricing for event/wedding planners or premium service
 * businesses.
 */
export const EventPlannerPricing = defineCapsule({
  name: 'EventPlannerPricing',
  description:
    "Three-tier planning-packages block on a muted band: a centered intro (uppercase eyebrow, thin light heading, lede) above a 3-up grid of rounded package cards; the 'popular' tier is filled with the primary color and lifted with a shadow plus a corner ribbon, while the others are plain cards. Each card shows name, tagline, large light price, a check-marked feature list, and a full-width pill CTA that records a real Lakebed pricing action. Use to present tiered pricing (e.g. Essential, Signature, White Glove) for event/wedding planners or premium service businesses.",
  lakebed: inquiryLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    cta: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          features: z.array(z.string()),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingEyebrow = props.eyebrow ?? 'Investment'
    const pricingHeading = props.heading ?? 'Planning Packages'
    const pricingDesc =
      props.description ??
      'Transparent pricing for weddings and celebrations. Custom quotes available for corporate and destination events.'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            tagline: 'Day-of coordination',
            price: '$2,500',
            features: [
              'One month of pre-event support',
              'Day-of timeline creation',
              'Vendor coordination',
              'On-site management (10 hours)',
              'Setup and breakdown oversight',
            ],
          },
          {
            name: 'Signature',
            tagline: 'Partial planning',
            price: '$5,500',
            popular: true,
            features: [
              'Everything in Essential, plus:',
              'Six months of planning support',
              'Vendor recommendations & referrals',
              'Design concept & mood board',
              'Two venue walkthroughs',
              'Rehearsal coordination',
            ],
          },
          {
            name: 'White Glove',
            tagline: 'Full-service planning',
            price: '$12,000',
            features: [
              'Everything in Signature, plus:',
              'Full planning from day one',
              'Unlimited vendor meetings',
              'Custom design & décor sourcing',
              'Guest management & RSVP tracking',
              'Dedicated lead planner + assistant',
            ],
          },
        ]
    return (
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <SectionHeading
            eyebrow={pricingEyebrow}
            title={pricingHeading}
            subtitle={pricingDesc}
            align="center"
            eyebrowClassName="text-muted-foreground tracking-widest"
            titleClassName="text-3xl font-light sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg"
            className="mx-auto mb-16 max-w-3xl gap-6 lg:mb-24"
          />
          <PricingGrid className={props.className}>
            {pricingTiers.map((tier) => {
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
