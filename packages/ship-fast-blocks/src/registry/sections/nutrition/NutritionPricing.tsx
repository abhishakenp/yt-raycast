import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
} from '#/section-kit/PricingGrid.tsx'

/**
 * NutritionPricing — fresh clean-editorial, collapsed-border pricing ledger for
 * a nutrition-coaching or wellness subscription, built on the shared PricingGrid
 * kit slots and backed by shared Lakebed conversion state. An asymmetric header
 * (mono eyebrow + big tracking-tight heading + lede left, mono plans meta right)
 * sits above a sharp-cornered, collapsed-border 3-tier ledger: each cell carries
 * a mono plan index, name, a giant tabular-nums price with mono period, a
 * hairline-divided feature checklist with primary ticks, and a full-width square
 * mutation CTA with a hard offset shadow and press feedback. The Pro tier
 * inverts to a dark bg-foreground surface with a rotated square "Most popular"
 * chip. Plans seed command search and every CTA records the selected plan to
 * Lakebed. All props are optional with baked defaults so it renders standalone.
 * Use on nutrition coaches, registered dietitians, meal-plan subscriptions, diet
 * / wellness programs or healthy-eating apps to present membership options.
 */
export const NutritionPricing = defineCapsule({
  name: 'NutritionPricing',
  description:
    "Fresh clean-editorial collapsed-border pricing ledger for a nutrition-coaching or wellness subscription, built on the shared PricingGrid kit slots and backed by shared Lakebed conversion state: an asymmetric header (mono eyebrow + big tracking-tight heading + lede left, mono plans meta right) above a sharp-cornered 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline feature checklists with primary ticks, and full-width square hard-shadow mutation CTAs; the Pro tier inverts to a dark surface with a rotated square 'Most popular' chip. Plans seed command search and every CTA records the selected plan. Use on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps to present membership options.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const heading = props.heading ?? 'Plans that grow with your goals'
    const subheading =
      props.subheading ??
      'Start fresh today. Cancel anytime—no contracts, no crash diets, just sustainable progress.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$19',
            period: '/mo',
            features: [
              'Personalized meal plan',
              'Recipe library access',
              'Basic progress tracking',
              'Weekly email check-ins',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
          },
          {
            name: 'Pro',
            price: '$49',
            period: '/mo',
            features: [
              'Everything in Starter',
              '1-on-1 dietitian coaching',
              'Custom macro targets',
              'Grocery list automation',
              'Priority chat support',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
            highlighted: true,
          },
          {
            name: 'Elite',
            price: '$99',
            period: '/mo',
            features: [
              'Everything in Pro',
              'Weekly 1:1 video sessions',
              'Lab & biomarker reviews',
              'Performance & sport nutrition',
              '24/7 priority support',
            ],
            cta: 'Start Now',
            ctaTarget: 'Pricing',
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features?.[0] ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric header: mono eyebrow + heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">03 / Membership</MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ plans ] billed monthly
            </p>
          </div>

          {/* Collapsed-border tier ledger — sharp corners, shared hairlines. */}
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, index) => {
              const isFeatured = Boolean(tier.highlighted)
              return (
                <PricingTier
                  key={tier.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8 lg:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      Most popular
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
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {tier.price}
                      </PricingTierPrice>
                      {tier.period ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {tier.period}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {tier.features ? (
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
                  {tier.cta ? (
                    <SaasPlanActionButton
                      lakebed={lakebed}
                      intentLabel={tier.ctaTarget ?? tier.cta}
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
