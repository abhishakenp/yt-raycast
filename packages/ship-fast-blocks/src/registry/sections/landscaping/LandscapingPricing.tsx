import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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

/**
 * LandscapingPricing — a centered-header 3-tier maintenance pricing section for a
 * landscaping / outdoor-design company on a warm stone band. A heading +
 * description introduce three rounded plan cards (name, audience, big price +
 * period, a check-listed feature set, and a full-width CTA button); the featured
 * middle plan inverts to a solid primary surface, lifts slightly, and carries a
 * corner "POPULAR" badge. Check marks, prices and buttons recolor for the
 * featured plan. Calm, organic and premium with a sage-green accent. CTAs route
 * through useNavigate. Use for recurring care / maintenance plans for landscapers,
 * lawn-care services or grounds-keeping companies. Renders fully with no props
 * via baked-in three-tier defaults.
 */
export const LandscapingPricing = defineCapsule({
  name: 'LandscapingPricing',
  description:
    'Centered-header 3-tier maintenance pricing section for a landscaping / outdoor-design company on a warm stone band: a heading + description introduce three rounded plan cards (name, audience, big price + period, a check-listed feature set, and a full-width CTA button); the featured middle plan inverts to a solid primary surface, lifts slightly, and carries a corner POPULAR badge, with check marks, prices and buttons recoloring for the featured plan. Calm, organic and premium with a sage-green accent; CTAs route through useNavigate. Use for recurring care / maintenance plans for landscapers, lawn-care services, garden designers or grounds-keeping companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          audience: z.string(),
          price: z.string(),
          period: z.string().optional(),
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
    const heading = props.heading ?? 'Maintenance plans'
    const description =
      props.description ??
      'Predictable pricing for ongoing care. All plans include scheduling flexibility and dedicated crew assignment.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential Care',
            audience: 'For compact properties under 5,000 sq ft',
            price: '$285',
            period: '/month',
            features: [
              'Bi-weekly mowing and edging',
              'Seasonal fertilization (4x/year)',
              'Spring and fall cleanup',
              'Weed control in beds',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Complete Care',
            audience: 'For standard residential properties',
            price: '$495',
            period: '/month',
            features: [
              'Weekly mowing and edging',
              'Full pruning and shaping',
              'Monthly health inspections',
              'Irrigation monitoring',
              'Priority scheduling',
            ],
            cta: 'Get Started',
            badge: 'POPULAR',
            featured: true,
          },
          {
            name: 'Estate Care',
            audience: 'For properties 1+ acres or complex gardens',
            price: 'Custom',
            features: [
              'Multiple weekly visits',
              'Dedicated garden specialist',
              'Seasonal color rotation',
              'Hardscape maintenance',
              '24-hour response guarantee',
            ],
            cta: 'Contact Us',
          },
        ]

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('mt-0.5 size-5 flex-shrink-0', className)}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    void CheckIcon
    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Maintenance plans'}
              subtitle={
                'Predictable pricing for ongoing care. All plans include scheduling flexibility and dedicated crew assignment.'
              }
            />
            {plans.map((tier) => {
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
