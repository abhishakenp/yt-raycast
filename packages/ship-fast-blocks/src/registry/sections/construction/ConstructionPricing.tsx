import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionPricing — industrial-brutalist rate card for a construction /
 * general contractor page. An asymmetric header (left mono eyebrow + extrabold
 * uppercase heading, mono rate-card index right) above a collapsed-border
 * spec-sheet ledger of three tiers framed by a 2px rule with a hard offset
 * shadow: each tier carries a mono tier index, an uppercase name, a giant
 * extrabold tabular price with its suffix and mono note, and hairline-ruled
 * feature rows. The featured tier inverts to a foreground band with a square
 * badge. Optional CTA buttons are square-edged with press feedback and route
 * through section-kit route links. Use to present transparent project pricing
 * for construction firms, contractors, builders, or remodeling companies.
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
    'Industrial-brutalist rate card for a construction / general contractor page: an asymmetric header (left mono eyebrow + extrabold uppercase heading, mono rate-card index right) above a collapsed-border spec-sheet ledger of three tiers framed by a 2px rule with a hard offset shadow — mono tier indexes, uppercase names, giant extrabold tabular prices with suffixes and mono notes, hairline-ruled feature rows, and a foreground-inverted featured tier with a square badge. Optional CTA buttons are square-edged with press feedback and route through section-kit route links. Use to present transparent project pricing for construction firms, contractors, builders, or remodeling companies.',
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
      <section
        className={cn(
          'overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="mb-4 mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              Rate card / {String(tiers.length).padStart(2, '0')} formats
            </p>
          </div>

          <PricingGrid className="mx-auto max-w-5xl gap-0 border-2 border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground/15 md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, i) => {
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
              const isFeatured = t.highlighted || t.featured || t.popular
              const ctaLabel = t.cta ?? props.cta
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-none border-0 border-b-2 border-foreground p-6 shadow-none ring-0 last:border-b-0 sm:p-8 md:border-b-0 md:border-r-2 md:last:border-r-0',
                    isFeatured ? 'bg-foreground text-background' : 'bg-card',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums',
                        isFeatured ? 'text-background/60' : 'text-primary',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {isFeatured ? (
                      <PricingTierBadge className="rounded-none bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground">
                        {t.badge ?? props.popularLabel ?? 'Popular'}
                      </PricingTierBadge>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-8 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)] text-foreground/25"
                      />
                    )}
                  </div>
                  <PricingTierHeader>
                    <PricingTierName
                      className={cn(
                        'text-base font-extrabold uppercase tracking-tight',
                        isFeatured && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/70')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <span className="flex items-baseline gap-1">
                      <PricingTierPrice
                        className={cn(
                          'text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl',
                          isFeatured && 'text-background',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {t.priceSuffix && (
                        <span className="text-2xl font-extrabold text-primary">
                          {t.priceSuffix}
                        </span>
                      )}
                    </span>
                    {t.note && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.15em]',
                          isFeatured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {t.note}
                      </PricingTierPeriod>
                    )}
                    {t.period && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.period}
                      </PricingTierPeriod>
                    )}
                    {t.unit && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.unit}
                      </PricingTierPeriod>
                    )}
                    {t.cadence && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.cadence}
                      </PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.suffix}
                      </PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-0 border-t pt-2',
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
                            'border-b border-dashed py-2.5 last:border-b-0 [&>svg]:hidden',
                            isFeatured
                              ? 'border-background/15 text-background/70'
                              : 'border-border',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[7px] size-1.5 shrink-0 bg-current"
                          />
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {ctaLabel && (
                    <PricingTierCta
                      target={t.ctaTarget}
                      className={cn(
                        'rounded-none font-mono text-xs font-bold uppercase tracking-[0.15em] transition-all duration-100 active:translate-y-px',
                        isFeatured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border-2 border-foreground bg-background text-foreground hover:bg-muted',
                      )}
                    >
                      {ctaLabel}
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
