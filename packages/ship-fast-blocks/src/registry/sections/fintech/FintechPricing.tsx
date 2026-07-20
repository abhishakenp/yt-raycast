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
import { Container } from '#/section-kit/Container.tsx'

/**
 * FintechPricing — Swiss-fintech collapsed-border pricing ledger for a neobank
 * landing page, backed by shared Lakebed conversion state. An asymmetric header
 * (heading + lede left, mono "[ PLANS ]" meta right) sits above a sharp-cornered,
 * collapsed-border 3-tier ledger whose cells share hairline rules; each cell
 * carries a mono plan index, name, a giant tabular-nums price with a mono
 * period, a hairline-divided feature checklist, and a square mutation CTA with a
 * hard offset shadow and mechanical press feedback. The highlighted tier inverts
 * to bg-foreground / text-background with a square "Popular" chip. Plans seed the
 * command search and every CTA records the selected plan to Lakebed. Use to
 * present tiered subscription pricing for banking, wallet, or fintech products.
 * Renders fully with no props via baked-in "Vault" defaults.
 */
export const FintechPricing = defineCapsule({
  name: 'FintechPricing',
  description:
    'Swiss-fintech collapsed-border pricing ledger for a neobank landing page backed by shared Lakebed conversion state: an asymmetric header (heading + lede left, mono plans meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline-divided feature checklists, and square hard-shadow mutation CTAs with press feedback; the highlighted tier inverts to a dark surface with a square Popular chip. Plans seed command search and every CTA records the selected plan. Use to present tiered subscription pricing for banking, wallet, or fintech products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers: name, price, period, features, cta, highlighted. */
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
    const heading = props.heading ?? 'Simple, transparent pricing'
    const subheading =
      props.subheading ??
      "No hidden fees, no surprises. Start free and upgrade whenever you're ready."
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Personal',
            price: '$0',
            period: '/mo',
            features: [
              'Free checking & savings',
              'Instant peer-to-peer transfers',
              'Virtual debit card',
              '3.5% APY on savings',
            ],
            cta: 'Open free account',
            ctaTarget: 'Open an Account',
          },
          {
            name: 'Plus',
            price: '$9',
            period: '/mo',
            features: [
              'Everything in Personal',
              'Premium metal card',
              'Spending insights & budgets',
              'Fee-free global ATM withdrawals',
              'Priority support',
            ],
            cta: 'Get Plus',
            ctaTarget: 'Open an Account',
            highlighted: true,
          },
          {
            name: 'Business',
            price: '$29',
            period: '/mo',
            features: [
              'Everything in Plus',
              'Multi-user team access',
              'Invoicing & expense tracking',
              'Accounting integrations',
              'Dedicated account manager',
            ],
            cta: 'Start Business',
            ctaTarget: 'Open an Account',
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
        }),
      ),
    )

    return (
      <section className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}>
        <Container size="xl" className="relative">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Pricing
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / no hidden fees
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {subheading}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ plans ] billed monthly
            </MonoTag>
          </div>

          <PricingGrid className="gap-0 border-l border-t border-border md:grid-cols-3 xl:grid-cols-3">
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
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8',
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
                      {String(index + 1).padStart(2, '0')} / plan
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
