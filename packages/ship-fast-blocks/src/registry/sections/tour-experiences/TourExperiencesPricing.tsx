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
} from '#/section-kit/PricingGrid.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * TourExperiencesPricing — editorial-wanderlust tour-package pricing ledger for
 * an adventure / guided-tour brand backed by shared Lakebed conversion state. A
 * mono metadata header above a sharp-cornered, collapsed-border 3-tier ledger
 * (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition): each cell
 * carries a mono package index, name, a giant tabular-nums per-person price with
 * a "/ person" period, a hairline-divided inclusions checklist, and a full-width
 * square "Book Now" mutation button with a hard offset shadow and press
 * feedback. The Full-Day tier inverts to bg-foreground / text-background with a
 * rotated "Popular" stamp. Every CTA records the selected package to shared
 * Lakebed state. Use to present bookable tour tiers on tour-operator, expedition,
 * and travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesPricing = defineCapsule({
  name: 'TourExperiencesPricing',
  description:
    "Editorial-wanderlust tour-package pricing ledger for an adventure / guided-tour brand backed by shared Lakebed conversion state: a mono metadata header above a sharp-cornered collapsed-border 3-tier ledger (Half-Day Escape, Full-Day Expedition, Multi-Day Expedition), each cell carrying a mono package index, name, a giant tabular-nums per-person price with a '/ person' period, a hairline-divided inclusions checklist, and a full-width square Book Now mutation button with a hard offset shadow and press feedback; the Full-Day tier inverts to a dark surface with a rotated Popular stamp. Packages seed shared state and every CTA records the selected package. Use to present bookable tour tiers on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Tour packages (name, price, period, features, cta). */
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Pick your pace, book your seat'
    const subheading =
      props.subheading ??
      'Transparent per-person pricing with everything you need included. No hidden fees, just unforgettable days out.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Half-Day Escape',
            price: '$89',
            period: '/ person',
            features: [
              '3-hour guided tour',
              'Small group (max 8)',
              'Local guide & insider stops',
              'Hotel pickup nearby',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
          },
          {
            name: 'Full-Day Expedition',
            price: '$159',
            period: '/ person',
            features: [
              'Full-day guided adventure',
              'Small group (max 8)',
              'Lunch & local tastings included',
              'All entry fees & gear',
              'Door-to-door transport',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
            highlighted: true,
          },
          {
            name: 'Multi-Day Expedition',
            price: '$640',
            period: '/ person',
            features: [
              '3-day guided expedition',
              'Boutique stays each night',
              'All meals & tastings',
              'Private guide & support crew',
              'Curated off-the-map routes',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book a Tour',
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period ?? '',
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section className="bg-background px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <Container size="xl">
          {/* Mono metadata header. */}
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2 tracking-[0.18em]">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Packages
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              tone="faint"
              aria-hidden="true"
              className="shrink-0 tracking-[0.18em]"
            >
              [ per person ] all-inclusive
            </MonoTag>
          </div>

          {/* Collapsed-border package ledger. */}
          <PricingGrid
            className={cn(
              'gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3',
              props.className,
            )}
          >
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
              const blurb = t.tagline || t.blurb || t.description || t.audience
              const period = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8 lg:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      {String(index + 1).padStart(2, '0')} / package
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-bold tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {blurb ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {blurb}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {period ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {period}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'mt-6 gap-0 divide-y border-t',
                        isFeatured
                          ? 'divide-background/15 border-background/15'
                          : 'divide-border border-border',
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
                            'gap-3 py-2.5',
                            isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85',
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
                    <SaasPlanActionButton
                      lakebed={lakebed}
                      intentLabel={t.ctaTarget ?? t.cta}
                      plan={t.name}
                      source="pricing"
                      aria-label={`${t.cta} for ${t.name}`}
                      pendingChildren={
                        <>
                          <SaasMutationSpinner className="size-4" />
                          Selecting
                        </>
                      }
                      className={cn(
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
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
