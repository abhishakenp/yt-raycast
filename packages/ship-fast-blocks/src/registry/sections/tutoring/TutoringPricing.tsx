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
import { Container } from '#/section-kit/Container.tsx'

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
    name: 'Single Session',
    price: '$45',
    period: '/session',
    features: [
      'One 60-minute 1-on-1 session',
      'Matched to your subject & goals',
      'Session summary for parents',
      'No commitment — try us out',
    ],
    cta: 'Book now',
    ctaTarget: 'Contact',
  },
  {
    name: '10-Session Pack',
    price: '$399',
    period: '/pack',
    features: [
      'Ten 60-minute sessions',
      'Save $51 vs. single sessions',
      'Same trusted tutor each week',
      'Progress tracking & check-ins',
      'Flexible rescheduling',
    ],
    cta: 'Get started',
    ctaTarget: 'Contact',
    highlighted: true,
  },
  {
    name: 'Monthly Unlimited',
    price: '$299',
    period: '/month',
    features: [
      'Unlimited weekly sessions',
      'Priority tutor matching',
      'Test-prep & homework support',
      'Monthly progress report',
    ],
    cta: 'Get started',
    ctaTarget: 'Contact',
  },
]

export const TutoringPricing = defineCapsule({
  name: 'TutoringPricing',
  description:
    "Transparent pricing band for tutoring sites, composing the PricingGrid kit composite into per-session and package tiers. Renders a Single Session pay-as-you-go option, a highlighted 10-Session Pack marked as most popular, and a Monthly Unlimited plan — each with a friendly feature list and a routed 'Book now' / 'Get started' CTA. Accepts a public `tiers` prop to override the plans. Use it to give parents clear, no-surprises options and reduce sticker shock.",
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
    const heading = props.heading ?? 'Simple, friendly pricing'
    const subheading =
      props.subheading ??
      'Pay as you go or save with a package — whatever fits your family. No hidden fees, ever.'
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
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
        </Container>
      </section>
    )
  },
})
