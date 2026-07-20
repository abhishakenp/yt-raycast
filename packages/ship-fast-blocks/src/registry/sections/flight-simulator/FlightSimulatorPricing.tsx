import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
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

/**
 * FlightSimulatorPricing — an instrument-ledger editions table for a flight
 * simulator landing page backed by shared Lakebed conversion state. An
 * asymmetric mono HUD header (heading left, `[ EDITIONS ] ONE-TIME` meta right)
 * and a giant ghost "SIM" watermark sit above a sharp-cornered, collapsed-border
 * 3-tier ledger: each cell carries a mono `NN / EDITION` index, name, a giant
 * tabular one-time price, a hairline-divided included-content checklist, and a
 * full-width square mutation CTA with a hard offset shadow and mechanical press
 * feedback. The featured Deluxe tier inverts to bg-foreground/text-background
 * with a rotated recommended chip. Editions seed command search and every CTA
 * records the selected plan to shared Lakebed state. Use to sell editions of a
 * flight sim, airliner / combat sim, or aviation title. Renders fully with no
 * props via baked defaults.
 */
export const FlightSimulatorPricing = defineCapsule({
  name: 'FlightSimulatorPricing',
  description:
    'Instrument-ledger editions table for a flight-simulator landing page backed by shared Lakebed conversion state: an asymmetric mono HUD header and a giant ghost "SIM" watermark above a sharp-cornered, collapsed-border 3-tier ledger (Standard, Deluxe, Premium) with mono NN / EDITION indexes, giant tabular one-time prices, hairline included-content checklists, and full-width square hard-shadow mutation CTAs; the featured Deluxe tier inverts to a dark surface with a rotated recommended chip. Editions seed command search and every CTA records the selected plan. Use to sell editions of a flight sim, airliner / combat sim, or aviation title.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Navigation target for every edition CTA. */
    ctaTarget: z.string().optional(),
    /** Pricing tiers: name, price, period, features, cta, highlighted. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Choose your edition'
    const ctaTarget = props.ctaTarget ?? 'Buy'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Standard',
            price: '$59.99',
            period: 'one-time',
            features: [
              '20 hand-crafted aircraft',
              '30 detailed airports',
              'Global photoreal scenery',
              'Live real-world weather',
              'Multiplayer & shared skies',
            ],
            cta: 'Buy Standard',
          },
          {
            name: 'Deluxe',
            price: '$89.99',
            period: 'one-time',
            features: [
              'Everything in Standard',
              '35 aircraft, incl. 5 study-level',
              '40 detailed airports',
              'Enhanced airliner systems',
              'Priority content updates',
            ],
            cta: 'Buy Deluxe',
            highlighted: true,
          },
          {
            name: 'Premium',
            price: '$119.99',
            period: 'one-time',
            features: [
              'Everything in Deluxe',
              '50 aircraft, incl. 10 study-level',
              '50 hand-built hub airports',
              'Full VR support & hardware kit',
              'Exclusive livery & mission packs',
            ],
            cta: 'Buy Premium',
          },
        ]

    const tiersWithTarget = tiers.map((t) => ({ ...t, ctaTarget }))

    useSyncSaasPlans(
      lakebed,
      tiersWithTarget.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period ?? '',
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pb-20 pt-24 lg:pb-28 lg:pt-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-8 text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          SIM
        </Watermark>
        <Container className="relative">
          {/* Asymmetric HUD header. */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                />
                Editions
              </MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={props.subheading}
                titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              />
            </div>
            <MonoTag tone="faint" className="shrink-0">
              [ editions ] one-time
            </MonoTag>
          </div>

          {/* Collapsed-border editions ledger. */}
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {tiersWithTarget.map((tier, index) => {
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
              const unit = t.period || t.unit || t.cadence || t.suffix
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
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {t.badge ?? 'Recommended'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      {String(index + 1).padStart(2, '0')} / edition
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
                          'text-4xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {unit ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {unit}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features ? (
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
                  ) : null}
                  {t.cta ? (
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
                  ) : null}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
