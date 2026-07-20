import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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

/**
 * LandscapingPricing — organic-editorial maintenance-pricing ledger for a
 * landscaping / outdoor-design company, backed by shared Lakebed conversion
 * state. An asymmetric header (mono "Pricing" meta + tight-tracked heading left,
 * mono meta right) sits above a sharp-cornered, collapsed-border 3-tier ledger
 * (rounded-none, shared hairlines): each tier carries a mono plan index
 * ("01 / plan"), a name, an audience blurb, a giant tabular-nums price + period,
 * a hairline-divided check feature list, and a full-width square CTA with a hard
 * offset shadow and mechanical press feedback. The featured tier inverts to
 * bg-foreground / text-background with a rotated mono badge chip. Plans seed
 * command search and every CTA records the selected plan or sales intent to
 * shared Lakebed state. Use for recurring care / maintenance plans for
 * landscapers, lawn-care services, garden designers or grounds-keeping
 * companies. Renders fully with no props via baked-in three-tier defaults.
 */
export const LandscapingPricing = defineCapsule({
  name: 'LandscapingPricing',
  description:
    'Organic-editorial maintenance-pricing ledger for a landscaping / outdoor-design company backed by shared Lakebed conversion state: an asymmetric header (mono pricing meta + tight-tracked heading left, mono meta right) above a sharp-cornered, collapsed-border 3-tier ledger (rounded-none, shared hairlines) with mono plan indexes, audience blurbs, giant tabular-nums prices + periods, hairline-divided check feature lists, and full-width square mutation CTAs with hard offset shadow and press feedback; the featured tier inverts to bg-foreground / text-background with a rotated mono badge chip. Plans seed command search and every CTA records selected plan or sales intent. Use for recurring care / maintenance plans for landscapers, lawn-care services, garden designers or grounds-keeping companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          audience: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          badge: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Maintenance plans'
    const description =
      props.description ??
      'Predictable pricing for ongoing care. All plans include scheduling flexibility and dedicated crew assignment.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential Care',
            audience: 'For compact properties under 5,000 sq ft',
            price: '$285',
            period: '/month',
            features: [
              'Bi-weekly mowing and edging',
              'Seasonal fertilization (4x/year)',
              'Spring and fall cleanup',
              'Weed control in beds',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Complete Care',
            audience: 'For standard residential properties',
            price: '$495',
            period: '/month',
            features: [
              'Weekly mowing and edging',
              'Full pruning and shaping',
              'Monthly health inspections',
              'Irrigation monitoring',
              'Priority scheduling',
            ],
            cta: 'Get Started',
            badge: 'POPULAR',
            featured: true,
          },
          {
            name: 'Estate Care',
            audience: 'For properties 1+ acres or complex gardens',
            price: 'Custom',
            features: [
              'Multiple weekly visits',
              'Dedicated garden specialist',
              'Seasonal color rotation',
              'Hardscape maintenance',
              '24-hour response guarantee',
            ],
            cta: 'Contact Us',
          },
        ]
    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.period,
          price: plan.price,
          summary: plan.audience || plan.features.at(0) || '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric header: mono meta + heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Pricing
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · ongoing care
                </span>
              </MonoTag>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
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
            {plans.map((tier, index) => {
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
              const blurb = t.audience || t.tagline || t.blurb || t.description
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
                      'mt-6 gap-0 divide-y border-t',
                      isFeatured
                        ? 'divide-background/15 border-background/15'
                        : 'divide-border border-border',
                    )}
                  >
                    {(t.features ?? []).map((feature) => (
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
