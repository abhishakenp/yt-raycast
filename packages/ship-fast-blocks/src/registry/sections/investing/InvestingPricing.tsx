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
 * InvestingPricing — Swiss-fintech collapsed-border pricing ledger for an
 * investing / brokerage page, backed by shared Lakebed conversion state. An
 * asymmetric header (heading + lede left, mono "[ plans ]" meta right) sits above
 * a sharp-cornered, collapsed-border 3-tier ledger whose cells share hairline
 * rules; each cell carries a mono plan index, name, tagline, a giant tabular-nums
 * price with a mono period, a hairline-divided feature checklist (excluded rows
 * struck through), and a square mutation CTA with a hard offset shadow and
 * mechanical press feedback. The highlighted "Most Popular" tier inverts to
 * bg-foreground / text-background with a square badge. Plans seed the command
 * search and every CTA records the selected plan to Lakebed. Use to present
 * subscription tiers for a brokerage, trading app or robo-advisor. Renders fully
 * with no props via Essential / Pro / Elite defaults.
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
export const InvestingPricing = defineCapsule({
  name: 'InvestingPricing',
  description:
    "Swiss-fintech collapsed-border pricing ledger for an investing / brokerage page backed by shared Lakebed conversion state: an asymmetric header (heading + lede left, mono plans meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline-divided feature checklists (excluded rows struck through), and square hard-shadow mutation CTAs with press feedback; the highlighted 'Most Popular' tier inverts to a dark surface with a square badge. Plans seed command search and every CTA records the selected plan. Use to present subscription tiers for a brokerage, trading app or robo-advisor.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Floating badge label on the popular tier. */
    popularLabel: z.string().optional(),
    /** Pricing tiers. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          popular: z.boolean().optional(),
          features: z.array(
            z.object({
              label: z.string(),
              included: z.boolean(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free and upgrade when you need more. No hidden fees, ever.'
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            tagline: 'Perfect for getting started',
            price: '$0',
            period: '/month',
            cta: 'Get started free',
            features: [
              {
                label: 'Commission-free trades',
                included: true,
              },
              {
                label: 'Basic charting tools',
                included: true,
              },
              {
                label: 'Stocks & ETFs',
                included: true,
              },
              {
                label: 'Mobile & web access',
                included: true,
              },
              {
                label: 'Advanced charts',
                included: false,
              },
              {
                label: 'Options trading',
                included: false,
              },
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious investors',
            price: '$9',
            period: '/month',
            cta: 'Start Pro trial',
            popular: true,
            features: [
              {
                label: 'Everything in Essential',
                included: true,
              },
              {
                label: 'Advanced charting (50+ indicators)',
                included: true,
              },
              {
                label: 'Options & crypto trading',
                included: true,
              },
              {
                label: 'AI-powered insights',
                included: true,
              },
              {
                label: 'Extended hours trading',
                included: true,
              },
              {
                label: 'Priority support',
                included: false,
              },
            ],
          },
          {
            name: 'Elite',
            tagline: 'For professional traders',
            price: '$29',
            period: '/month',
            cta: 'Contact sales',
            features: [
              {
                label: 'Everything in Pro',
                included: true,
              },
              {
                label: 'Level 2 market data',
                included: true,
              },
              {
                label: 'API access',
                included: true,
              },
              {
                label: 'Priority 24/7 support',
                included: true,
              },
              {
                label: 'Tax-loss harvesting',
                included: true,
              },
              {
                label: 'Dedicated account manager',
                included: true,
              },
            ],
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline ?? tier.features?.at(0)?.label ?? '',
        }),
      ),
    )

    return (
      <section
        id="pricing"
        className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
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
                {description}
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
              const isFeatured = Boolean(tier.popular)
              return (
                <PricingTier
                  key={tier.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {popularLabel}
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
                      {tier.name}
                    </PricingTierName>
                    {tier.tagline ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {tier.tagline}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {tier.price}
                      </PricingTierPrice>
                      {tier.period ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {tier.period}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  <PricingTierFeatures
                    className={cn(
                      'mt-6 gap-0 divide-y border-t',
                      isFeatured
                        ? 'divide-background/15 border-background/15'
                        : 'divide-border border-border',
                    )}
                  >
                    {tier.features.map((feature) => (
                      <PricingTierFeature
                        key={feature.label}
                        className={cn(
                          'gap-3 py-2.5',
                          feature.included
                            ? isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85'
                            : cn(
                                'line-through [&>svg]:invisible',
                                isFeatured
                                  ? 'text-background/40'
                                  : 'text-muted-foreground/60',
                              ),
                        )}
                      >
                        {feature.label}
                      </PricingTierFeature>
                    ))}
                  </PricingTierFeatures>
                  <SaasPlanActionButton
                    lakebed={lakebed}
                    intentLabel={tier.cta}
                    plan={tier.name}
                    source="pricing"
                    aria-label={`${tier.cta} for ${tier.name}`}
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
                    {tier.cta}
                  </SaasPlanActionButton>
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
