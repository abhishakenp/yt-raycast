import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
 * ConsultingPricing — Swiss-comparison engagement-models ledger for a
 * management-consulting firm page. A mono "05 / Engagement" metadata rail with
 * a hairline rule above an asymmetric left-aligned serif heading + lede, then
 * a collapsed-border 3-column tier ledger sharing hairline rules: each cell
 * carries a mono index numeral, name, description, a giant serif price with
 * mono unit, a hairline-ruled feature list, and a square-edged CTA with press
 * feedback. The featured tier is the page's inverted highlight cell (ink
 * background, light text, mono badge). All CTAs route through section-kit
 * route links. Use for pricing, service tiers, or engagement models on
 * consulting, advisory, or professional-services sites. Renders fully with no
 * props via three baked-in default tiers.
 */
export const ConsultingPricing = defineCapsule({
  name: 'ConsultingPricing',
  description:
    "Swiss-comparison engagement-models ledger for a management-consulting firm page: a mono '05 / Engagement' metadata rail with hairline rule above an asymmetric left-aligned serif heading + lede, then a collapsed-border 3-column tier ledger sharing hairline rules — each cell with a mono index numeral, name, description, giant serif price with mono unit, hairline-ruled feature list, and square-edged CTA with press feedback; the featured tier is an inverted ink highlight cell with a mono badge. All CTAs route through section-kit route links. Use for pricing, service tiers, or engagement models on consulting, advisory, or professional-services sites.",
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
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            <MonoTag className="shrink-0">05 / Engagement</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden tabular-nums sm:inline">
              {String(tiers.length).padStart(2, '0')} Models
            </MonoTag>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-3xl gap-4 lg:mb-16"
            titleClassName="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            subtitleClassName="max-w-xl text-lg text-muted-foreground"
          />

          <PricingGrid className="grid-cols-1 items-stretch gap-0 border-l border-t border-border md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, index) => {
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
              const isFeatured = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'gap-6 rounded-none border-0 border-b border-r border-border p-6 shadow-none ring-0 sm:p-8',
                    isFeatured ? 'bg-foreground text-background' : 'bg-card',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <MonoTag
                      className={cn(
                        'tabular-nums',
                        isFeatured
                          ? 'text-background/50'
                          : 'text-muted-foreground/70',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </MonoTag>
                    {isFeatured ? (
                      <PricingTierBadge className="rounded-none bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-1.5 bg-primary"
                      />
                    )}
                  </div>
                  <PricingTierHeader className="gap-3">
                    <PricingTierName
                      className={cn(
                        'font-serif text-2xl font-bold tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(
                          'leading-relaxed',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <span className="mt-2 flex flex-wrap items-baseline gap-x-2">
                      <PricingTierPrice
                        className={cn(
                          'font-serif text-5xl font-bold tracking-tight tabular-nums sm:text-6xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            isFeatured && 'text-background/50',
                          )}
                        >
                          {t.period}
                        </PricingTierPeriod>
                      )}
                      {t.unit && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            isFeatured && 'text-background/50',
                          )}
                        >
                          {t.unit}
                        </PricingTierPeriod>
                      )}
                      {t.cadence && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            isFeatured && 'text-background/50',
                          )}
                        >
                          {t.cadence}
                        </PricingTierPeriod>
                      )}
                      {t.suffix && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            isFeatured && 'text-background/50',
                          )}
                        >
                          {t.suffix}
                        </PricingTierPeriod>
                      )}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-0 border-t',
                        isFeatured ? 'border-background/20' : 'border-border',
                      )}
                    >
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(
                            'gap-3 border-b py-3',
                            isFeatured
                              ? 'border-background/20 text-background/70 [&>svg]:text-background/60'
                              : 'border-border [&>svg]:text-foreground/60',
                          )}
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <PricingTierCta
                      target={t.ctaTarget}
                      className={cn(
                        'rounded-none px-6 py-3 text-sm font-medium transition-all duration-150 active:translate-y-px',
                        isFeatured
                          ? 'bg-background text-foreground hover:bg-background/90'
                          : 'bg-foreground text-background hover:bg-foreground/90',
                      )}
                    >
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
