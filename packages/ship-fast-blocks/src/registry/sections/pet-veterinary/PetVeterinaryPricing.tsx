import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

const DEFAULT_TIERS: {
  name: string
  price: string
  period?: string
  features?: string[]
  cta?: string
  ctaTarget?: string
  highlighted?: boolean
}[] = [
  {
    name: 'Basic Wellness',
    price: '$29',
    period: '/month',
    features: [
      'Annual wellness exam',
      'Core vaccinations',
      'Heartworm test',
      '10% off additional services',
    ],
    cta: 'Choose Basic',
    ctaTarget: 'Contact',
  },
  {
    name: 'Plus Care',
    price: '$49',
    period: '/month',
    features: [
      'Everything in Basic',
      'Two wellness exams a year',
      'Dental check & cleaning',
      'Flea, tick & heartworm prevention',
      '15% off additional services',
    ],
    cta: 'Choose Plus',
    ctaTarget: 'Contact',
    highlighted: true,
  },
  {
    name: 'Complete Care',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Plus',
      'Unlimited wellness visits',
      'Routine bloodwork & labs',
      'Priority emergency access',
      '20% off additional services',
    ],
    cta: 'Choose Complete',
    ctaTarget: 'Contact',
  },
]

export const PetVeterinaryPricing = defineCapsule({
  name: 'PetVeterinaryPricing',
  description:
    'Transparent wellness-plan pricing band for a veterinary clinic site, composing the PricingGrid kit composite into membership tiers. Renders a Basic Wellness plan, a highlighted Plus Care plan marked as most popular, and a Complete Care plan — each with a friendly feature list and a routed CTA. Accepts a public `tiers` prop to override the plans. Use it to give pet parents clear, no-surprises options for keeping their companions healthy year-round.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Wellness plans made simple'
    const subheading =
      props.subheading ??
      'Affordable monthly care that spreads the cost of keeping your pet healthy — no hidden fees, ever.'
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PricingGrid>
            <SectionHeading title={heading} subtitle={subheading} />
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
        </div>
      </section>
    )
  },
})
