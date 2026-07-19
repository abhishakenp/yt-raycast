import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionPricing — three-tier pricing table for a construction / general
 * contractor page. A centered section heading above a responsive 3-column
 * grid of pricing cards with a "Most Popular" highlight on the featured tier.
 * Each card lists features with check icons and a CTA button that routes
 * through useNavigate. Use to present transparent project pricing for
 * construction firms, contractors, builders, or remodeling companies.
 * Renders fully with no props via baked-in defaults.
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
export const ConstructionPricing = defineCapsule({
  name: 'ConstructionPricing',
  description:
    "Three-tier pricing table for a construction / general contractor page: a centered section heading above a responsive 3-column grid of pricing cards with a 'Most Popular' highlight on the featured tier. Each card lists features with check icons and a CTA button that routes through useNavigate. Use to present transparent project pricing for construction firms, contractors, builders, or remodeling companies.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** CTA button label on each tier. */
    cta: z.string().optional(),
    /** Label for the featured "Most Popular" badge. */
    popularLabel: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          priceSuffix: z.string(),
          note: z.string(),
          features: z.array(z.string()),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Transparent pricing for every project'
    const description =
      props.description ??
      'Every project is unique. Here are typical starting points for our most common project types. Final pricing depends on scope, materials, and timeline.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Kitchen Remodel',
            price: '$45K',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Cabinet replacement',
              'Countertop installation',
              'Flooring & lighting',
              '6-8 week timeline',
            ],
          },
          {
            name: 'Custom Home',
            price: '$650K',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Complete design-build',
              '3,000-5,000 sq ft',
              'Premium finishes',
              '12-18 month timeline',
            ],
            featured: true,
          },
          {
            name: 'Commercial Build',
            price: '$2M',
            priceSuffix: '+',
            note: 'Starting price',
            features: [
              'Turnkey delivery',
              '20,000+ sq ft',
              'LEED certification available',
              '18-36 month timeline',
            ],
          },
        ]
    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            eyebrowClassName="text-sm tracking-wider text-muted-foreground"
            titleClassName="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Transparent pricing for every project'}
              subtitle={
                'Every project is unique. Here are typical starting points for our most common project types. Final pricing depends on scope, materials, and timeline.'
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
