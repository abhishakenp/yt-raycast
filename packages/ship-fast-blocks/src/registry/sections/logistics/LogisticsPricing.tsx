import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsPricing — a three-tier service-pricing table for a global-logistics /
 * freight-forwarding company. A centered heading + lede over a 1 → 3 column grid
 * of pricing cards; the featured tier inverts to a solid primary surface and can
 * carry a floating "Popular" badge. Each card lists name, tagline, a large price
 * with unit, a check-marked feature list and a full-width CTA, with a centered
 * footnote below. Clean and corporate on a light surface with a deep slate
 * primary; every CTA routes through useNavigate. Use to present shipping service
 * tiers (Standard / Priority / Express) for logistics, freight-forwarding,
 * shipping, courier or cargo/transport companies. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
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
export const LogisticsPricing = defineCapsule({
  name: 'LogisticsPricing',
  description:
    "Three-tier service-pricing table for a global-logistics / freight-forwarding company: a centered heading + lede over a 1 → 3 column grid of pricing cards, with the featured tier inverted to a solid primary surface and an optional floating 'Popular' badge. Each card lists name, tagline, a large price with unit, a check-marked feature list and a full-width CTA, plus a centered footnote below. Clean and corporate on a light surface with a deep slate primary; every CTA routes through useNavigate. Use to present shipping service tiers (Standard / Priority / Express) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    footnote: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          badge: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Service tiers'
    const description =
      props.description ??
      'Choose the service level that matches your timeline and budget.'
    const footnote =
      props.footnote ??
      'Ocean freight rates from $85/CBM. Ground transport from $1.45/mile. Volume discounts available.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Standard',
            tagline: 'Economy shipping for non-urgent cargo',
            price: '$2.80',
            unit: '/kg air',
            features: [
              '5-7 day air transit',
              'Standard tracking',
              '$100 insurance included',
              'Email support',
            ],
            cta: 'Get a quote',
          },
          {
            name: 'Priority',
            tagline: 'Best balance of speed and cost',
            price: '$4.50',
            unit: '/kg air',
            features: [
              '2-4 day air transit',
              'Real-time GPS tracking',
              '$500 insurance included',
              '24/7 phone & email support',
              'Customs brokerage',
            ],
            cta: 'Get a quote',
            badge: 'Popular',
            featured: true,
          },
          {
            name: 'Express',
            tagline: 'When every hour counts',
            price: '$8.90',
            unit: '/kg air',
            features: [
              'Next-flight-out (NFO)',
              'Real-time GPS + EDI',
              '$2,500 insurance included',
              'Dedicated account manager',
              'Charter options available',
            ],
            cta: 'Contact sales',
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    void Check
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Service tiers'}
              subtitle={
                'Choose the service level that matches your timeline and budget.'
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

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {footnote}
          </p>
        </Container>
      </section>
    )
  },
})
