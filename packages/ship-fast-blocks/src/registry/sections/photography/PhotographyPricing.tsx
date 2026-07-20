import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

import {
  SaasMutationSpinner,
  SaasPlanActionButton,
  saasPlan,
  useSyncSaasPlans,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
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

/**
 * PhotographyPricing — collapsed-border session-package ledger for a fine-art /
 * wedding photographer site, backed by shared Lakebed conversion state. An
 * asymmetric editorial header (mono eyebrow + serif heading left, mono meta
 * right) sits above a sharp-cornered, collapsed-border 3-tier ledger built on
 * the shared `PricingGrid` composite: each cell carries a mono tier index, a
 * serif tier name, a giant tabular-nums price, a hairline-divided inclusions
 * checklist, and a full-width square "Book a Shoot" CTA with a hard offset
 * shadow and press feedback. The featured wedding tier inverts to
 * bg-foreground/text-background with a square "Popular" chip. Every CTA records
 * the selected package to shared Lakebed state and seeds command search. Use to
 * present collections for photographers, studios, and elopement shooters.
 * Renders fully with no props via baked-in defaults.
 */
export const PhotographyPricing = defineCapsule({
  name: 'PhotographyPricing',
  description:
    'Collapsed-border session-package pricing ledger for a fine-art / wedding photographer site backed by shared Lakebed conversion state, built on the shared PricingGrid composite: an asymmetric mono-eyebrow + serif header above a sharp 3-tier collapsed-border ledger with mono tier indexes, serif tier names, giant tabular-nums prices, hairline inclusions checklists, and full-width square hard-shadow CTAs with press feedback; the featured wedding tier inverts to a dark surface with a square Popular chip. Plans seed command search and every CTA records the selected package. Use to present collections and session packages for photographers, studios, and elopement shooters.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers: name, price, coverage period, inclusions, CTA, highlight. */
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
    const heading = props.heading ?? 'Session packages'
    const subheading =
      props.subheading ??
      'Transparent collections for portraits, weddings, and destinations — every package includes a personal gallery and full editing.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Portrait Session',
            price: '$450',
            period: '/ session',
            features: [
              'Up to 90 minutes of coverage',
              'One location of your choice',
              '40+ edited high-resolution images',
              'Private online gallery',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
          },
          {
            name: 'Full-Day Wedding',
            price: '$3,800',
            period: '/ day',
            features: [
              'Up to 10 hours of coverage',
              'Second photographer included',
              '600+ edited images, delivered in 4 weeks',
              'Engagement session included',
              'Heirloom print credit',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
            highlighted: true,
          },
          {
            name: 'Destination',
            price: '$5,500',
            period: '+ travel',
            features: [
              'Multi-day elopement coverage',
              'Travel & lodging coordinated',
              'Full edited gallery, no image cap',
              'Custom film & album add-ons',
            ],
            cta: 'Book a Shoot',
            ctaTarget: 'Contact',
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
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric editorial header — serif heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">02 / Collections</MonoTag>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
                {subheading}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ packages ] all-in
            </span>
          </div>

          {/* Collapsed-border tier ledger — sharp corners, shared hairlines. */}
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
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
                    <PricingTierBadge className="absolute -top-3 right-6 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
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
                        'mt-3 font-serif text-xl font-medium tracking-tight',
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
                          key={feature}
                          className={cn(
                            'gap-3 py-2.5',
                            isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85',
                          )}
                        >
                          {feature}
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
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
