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
 * ConsultingPricing — 3-tier engagement-models pricing block for a
 * management-consulting firm page. A centered heading and lead paragraph above
 * a responsive 3-column grid of tier cards; the middle tier can be featured
 * (dark primary card with a badge). Each tier includes name, price, unit,
 * description, a feature list with check icons, and a CTA button. All CTAs
 * route through useNavigate. Use for pricing, service tiers, or engagement
 * models on consulting, advisory, or professional-services sites. Renders fully
 * with no props via three baked-in default tiers.
 */
export const ConsultingPricing = defineCapsule({
  name: 'ConsultingPricing',
  description:
    '3-tier engagement-models pricing block for a management-consulting firm page: a centered heading and lead paragraph above a responsive 3-column grid of tier cards, with an optional featured middle tier (dark primary card with a badge). Each tier shows name, price, unit, description, a feature list with check icons, and a CTA button. All CTAs route through useNavigate. Use for pricing, service tiers, or engagement models on consulting, advisory, or professional-services sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          unit: z.string().optional(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Engagement Models'
    const description =
      props.description ??
      'Flexible approaches tailored to your unique challenges, timeline, and organizational needs.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Strategic Advisory',
            price: '$45K',
            unit: '/month',
            description:
              'Ideal for executive-level guidance on strategic direction, market entry, or transformation planning. Includes weekly advisory sessions and strategic roadmapping.',
            features: [
              'Monthly strategy sessions',
              'Executive coaching',
              'Market intelligence reports',
            ],
            cta: 'Learn More',
          },
          {
            name: 'Transformation Partnership',
            price: 'Custom',
            description:
              'Comprehensive support for major transformation initiatives. Dedicated team embedded with your organization for strategy through implementation.',
            features: [
              'Dedicated project team',
              'Full implementation support',
              'Change management',
              'Capability building',
            ],
            cta: 'Schedule Consultation',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Capability Building',
            price: '$85K',
            unit: '/program',
            description:
              'Intensive training and development programs to build internal consulting capabilities and leadership skills within your organization.',
            features: [
              'Workshop-based training',
              'Real project application',
              '12-week program duration',
            ],
            cta: 'Learn More',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Engagement Models'}
              subtitle={
                'Flexible approaches tailored to your unique challenges, timeline, and organizational needs.'
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
