import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
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

/**
 * OnlineCoursePricing — a 3-tier enrollment-plan band for an online-course
 * page. Thin configuration over the shared PricingGrid composite: a centered
 * heading + intro above a responsive 3-column grid of plan cards (name, price,
 * checkmark feature bullets, and a CTA). The middle "Pro" tier is highlighted
 * with a primary border, shadow, and a "Most popular" pill, and every CTA
 * routes through useNavigate. Use to present enrollment options — Free Audit,
 * Pro, Team — on an e-learning, bootcamp, or academy landing page. Renders
 * fully with no props via baked-in defaults.
 */
export const OnlineCoursePricing = defineCapsule({
  name: 'OnlineCoursePricing',
  description:
    "A 3-tier enrollment-plan band for an online-course page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of plan cards (name, price, checkmark feature bullets, and a CTA). The middle 'Pro' tier is highlighted with a primary border, shadow, and a 'Most popular' pill, and every CTA routes through useNavigate. Use to present enrollment options — Free Audit, Pro, Team — on an e-learning, bootcamp, or academy landing page.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers (supply exactly 3); mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Enroll your way'
    const subheading =
      props.subheading ??
      'Start free to preview the course, go Pro for the full certificate path, or bring your whole team.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free Audit',
            price: '$0',
            period: '',
            features: [
              'First module unlocked',
              'Community read access',
              'No certificate',
              'Cancel anytime',
            ],
            cta: 'Start free',
            highlighted: false,
          },
          {
            name: 'Pro',
            price: '$149',
            period: 'one-time',
            features: [
              'All modules & projects',
              'Certificate of completion',
              'Full community access',
              'Downloadable resources',
              'Lifetime updates',
            ],
            cta: 'Enroll now',
            highlighted: true,
          },
          {
            name: 'Team',
            price: '$99',
            period: 'per seat',
            features: [
              'Everything in Pro',
              '5+ seats',
              'Team progress dashboard',
              'Priority mentor support',
              'Invoicing & SSO',
            ],
            cta: 'Enroll now',
            highlighted: false,
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <PricingGrid>
            <SectionHeading title={heading} subtitle={subheading} />
            {tiers
              .map((t) => ({
                name: t.name,
                price: t.price,
                period: t.period,
                features: t.features,
                cta: t.cta,
                ctaTarget: t.cta,
                highlighted: t.highlighted,
              }))
              .map((tier) => {
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
                      <PricingTierBadge>
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
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
                      {t.unit && (
                        <PricingTierPeriod>{t.unit}</PricingTierPeriod>
                      )}
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
