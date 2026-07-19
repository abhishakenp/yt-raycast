import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ManufacturingPricing — a 3-tier pricing block for a precision-manufacturing
 * site. A centered eyebrow + heading + description intro sits above a three-
 * column card row; the featured tier inverts to a foreground surface and carries
 * a centered "Most Popular" badge, each card showing a name, blurb, price (with
 * optional /hr unit), a checklist of features and a full-width CTA routed
 * through useNavigate. Clean, neutral, transparent. Use to present
 * prototype/low-volume/production pricing on machine-shop or contract-
 * manufacturer pages. Renders fully with no props via baked-in defaults.
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
export const ManufacturingPricing = defineCapsule({
  name: 'ManufacturingPricing',
  description:
    "A 3-tier pricing block for a precision-manufacturing site: a centered eyebrow + heading + description intro above a three-column card row; the featured tier inverts to a foreground surface and carries a centered 'Most Popular' badge, each card showing a name, blurb, price (with optional /hr unit), a checklist of features and a full-width CTA routed through useNavigate. Clean, neutral, transparent. Use to present prototype/low-volume/production pricing on machine-shop or contract-manufacturer pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          unit: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Transparent Pricing for Every Stage'
    const description =
      props.description ??
      'No hidden fees. Volume discounts apply. All quotes include material, machining, inspection, and standard packaging.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Prototypes',
            blurb: '1-10 parts for testing and validation',
            price: '$95',
            unit: '/hr',
            features: [
              '2-3 day turnaround',
              'Material certs included',
              'DFM feedback',
              'Photo documentation',
            ],
            cta: 'Get Prototype Quote',
          },
          {
            name: 'Low-Volume',
            blurb: '11-100 parts for pilot runs',
            price: '$75',
            unit: '/hr',
            features: [
              '1-2 week turnaround',
              'FAIR documentation',
              'PPAP Level 3 available',
              'CMM inspection reports',
              'Priority scheduling',
            ],
            cta: 'Get Quote',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Production',
            blurb: '100+ parts with volume pricing',
            price: 'Custom',
            features: [
              'Dedicated work cells',
              'Blanket orders accepted',
              'Kanban programs',
              'Annual pricing agreements',
            ],
            cta: 'Contact Sales',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            eyebrowClassName="text-sm font-medium uppercase tracking-wider text-muted-foreground"
            titleClassName="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="mt-4 text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Transparent Pricing for Every Stage'}
              subtitle={
                'No hidden fees. Volume discounts apply. All quotes include material, machining, inspection, and standard packaging.'
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
