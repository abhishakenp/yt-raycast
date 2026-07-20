import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { directoryLakebed } from './directory-lakebed.ts'
/**
 * DirectoryPricing — "advertising rates" pricing ledger for a local-business
 * directory. A muted-wash section with an asymmetric hairline header (serif
 * heading + description left, mono "Rate card" meta right) and a 3-column
 * grid of sharp-cornered rate cards: each has a mono uppercase plan name with
 * an index numeral, a giant serif price with mono period, a tagline, a
 * hairline-divided ledger of included features with check icons plus excluded
 * lines with muted struck-through crosses, and a full-width square CTA with
 * press feedback. The featured plan carries a heavy border, a hard offset
 * shadow, and a rotated stamp badge. CTAs record real Lakebed lead actions.
 * Use as the listing/subscription pricing section on local directories,
 * marketplaces, or find-a-service platforms.
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
} from '#/section-kit/PricingGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  DirectoryLeadButton,
  DirectoryMutationSpinner,
} from './directory-interactions.tsx'
export const DirectoryPricing = defineCapsule({
  name: 'DirectoryPricing',
  description:
    'Advertising-rates pricing ledger for a local-business DIRECTORY: a muted-wash section with an asymmetric hairline header (serif heading and description left, mono meta right) and a 3-column grid of sharp-cornered rate cards — each has a mono uppercase plan name with an index numeral, a giant serif price with mono period, a tagline, a hairline-divided ledger of included features with check icons plus excluded lines with muted struck-through crosses, and a full-width square CTA with press feedback. The featured plan carries a heavy border, hard offset shadow, and rotated stamp badge. CTAs record real Lakebed lead actions. Use as the listing or subscription pricing section on local directories, business-listing marketplaces, or find-a-service platforms.',
  lakebed: directoryLakebed,
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          tagline: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean(),
          badge: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'List Your Business'
    const description =
      props.description ??
      'Choose the plan that works for your business. Start free and upgrade as you grow.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Basic',
            price: 'Free',
            period: '',
            tagline: 'Perfect for getting started',
            features: [
              'Basic business listing',
              'Contact information',
              'Customer reviews',
            ],
            excluded: ['Photos & media', 'Priority placement'],
            cta: 'Get Started Free',
            featured: false,
            badge: '',
          },
          {
            name: 'Premium',
            price: '$29',
            period: '/month',
            tagline: 'Best for growing businesses',
            features: [
              'Everything in Basic',
              'Up to 20 photos',
              'Business description',
              'Priority search results',
              'Analytics dashboard',
            ],
            excluded: [],
            cta: 'Start 14-Day Trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            price: '$79',
            period: '/month',
            tagline: 'For multi-location businesses',
            features: [
              'Everything in Premium',
              'Multiple locations (5+)',
              'Unlimited photos',
              'Featured placement',
              'Dedicated support',
            ],
            excluded: [],
            cta: 'Contact Sales',
            featured: false,
            badge: '',
          },
        ]
    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              Rate card · Per listing
            </MonoTag>
          </div>
          <PricingGrid className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
            {plans.map((tier, tierIndex) => {
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
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-none bg-background p-6 shadow-none ring-0 sm:p-7',
                    isFeatured
                      ? 'border-2 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground/80 md:-translate-y-3'
                      : 'border-border',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3.5 left-6 rotate-[-3deg] rounded-none border border-foreground bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <PricingTierName className="font-mono text-xs uppercase tracking-[0.16em] text-foreground">
                        {t.name}
                      </PricingTierName>
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] tabular-nums text-muted-foreground/60"
                      >
                        {String(tierIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
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
                    <div className="mt-3 flex items-baseline gap-1 border-t border-border pt-4">
                      <PricingTierPrice className="font-serif text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
                        {t.price}
                      </PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod className="font-mono text-xs">
                          {t.period}
                        </PricingTierPeriod>
                      )}
                      {t.unit && (
                        <PricingTierPeriod className="font-mono text-xs">
                          {t.unit}
                        </PricingTierPeriod>
                      )}
                      {t.cadence && (
                        <PricingTierPeriod className="font-mono text-xs">
                          {t.cadence}
                        </PricingTierPeriod>
                      )}
                      {t.suffix && (
                        <PricingTierPeriod className="font-mono text-xs">
                          {t.suffix}
                        </PricingTierPeriod>
                      )}
                    </div>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures className="gap-0 divide-y divide-border border-y border-border">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className="py-2.5"
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                      {(t.excluded ?? []).map((excludedFeature) => (
                        <li
                          key={excludedFeature}
                          className="flex min-w-0 items-start gap-2 py-2.5 text-sm leading-6 text-muted-foreground/70"
                        >
                          <Cross className="mt-1 size-4 shrink-0 text-muted-foreground/50" />
                          <span className="line-through decoration-muted-foreground/40">
                            {excludedFeature}
                          </span>
                        </li>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <DirectoryLeadButton
                      lakebed={lakebed}
                      action={t.cta}
                      source={`pricing:${t.name}`}
                      pendingChildren={
                        <>
                          <DirectoryMutationSpinner />
                          Recording
                        </>
                      }
                      className={cn(
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-medium transition-[background-color,color,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-foreground text-background hover:bg-foreground/90'
                          : 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {t.cta}
                    </DirectoryLeadButton>
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
