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

/**
 * ManufacturingPricing — a heavy-industrial 3-tier pricing ledger for a
 * precision-manufacturing site backed by shared Lakebed conversion state. An
 * asymmetric header (mono index eyebrow + giant heading left, mono meta right)
 * sits above a collapsed-border (shared thick-hairline) 3-tier ledger: each cell
 * carries a mono plan index, name, blurb, a giant tabular-nums price with an
 * optional mono /hr unit, a hairline-divided feature checklist, and a full-width
 * squared mutation CTA with a hard offset shadow and mechanical press feedback.
 * The featured tier inverts to bg-foreground/text-background with a rotated badge
 * chip. Plans seed command search and every CTA records the selected plan or
 * sales intent to shared Lakebed state. Tech-brutalist, binary-radius,
 * transparent. Use to present prototype/low-volume/production pricing on machine-
 * shop or contract-manufacturer pages. Renders fully with no props via baked-in
 * defaults.
 */
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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const ManufacturingPricing = defineCapsule({
  name: 'ManufacturingPricing',
  description:
    'A heavy-industrial 3-tier pricing ledger for a precision-manufacturing site backed by shared Lakebed conversion state: an asymmetric header (mono index eyebrow + giant heading left, mono meta right) above a collapsed-border 3-tier ledger where each cell carries a mono plan index, name, blurb, a giant tabular-nums price with an optional mono /hr unit, a hairline-divided feature checklist, and a full-width squared mutation CTA with a hard offset shadow and mechanical press feedback; the featured tier inverts to bg-foreground/text-background with a rotated badge chip. Plans seed command search and every CTA records the selected plan or sales intent. Tech-brutalist, binary-radius, transparent. Use to present prototype/low-volume/production pricing on machine-shop or contract-manufacturer pages.',
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
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
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.unit ?? '',
          price: tier.price,
          summary: tier.blurb || tier.features.at(0) || '',
        }),
      ),
    )
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="mt-4 text-lg text-muted-foreground"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              [ quotes ] all inclusive
            </MonoTag>
          </div>
          <PricingGrid className="gap-0 border-l-2 border-t-2 border-foreground md:grid-cols-3 xl:grid-cols-3">
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
                    'gap-0 rounded-none border-0 border-b-2 border-r-2 border-foreground p-6 shadow-none sm:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border-2 md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none border-2 border-foreground bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      {String(index + 1).padStart(2, '0')} / tier
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-bold uppercase tracking-tight',
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
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums',
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
                  <PricingTierFeatures
                    className={cn(
                      'mt-6 gap-0 divide-y border-t-2',
                      isFeatured
                        ? 'divide-background/15 border-background/25'
                        : 'divide-border border-foreground',
                    )}
                  >
                    {(t.features ?? []).map((feature) => (
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none border-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0_0] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'border-background bg-background text-foreground shadow-background/40 hover:bg-background/90'
                          : 'border-foreground bg-foreground text-background shadow-foreground hover:bg-foreground/90',
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
