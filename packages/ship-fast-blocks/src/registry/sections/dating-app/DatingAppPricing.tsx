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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
 * DatingAppPricing — playful-geometric collapsed-border pricing ledger for a
 * dating / matchmaking app. An asymmetric header (left-aligned extrabold
 * heading + lede, mono "[ plans ] cancel anytime" meta right) above a sharp
 * 3-tier collapsed-border ledger: each cell carries a mono plan index, the
 * name, tagline, a giant extrabold tabular price + mono period, a
 * hairline-divided checklist where excluded features render crossed out, and
 * a full-width rounded-full pill CTA with hard offset shadow and press
 * feedback. The featured tier inverts to bg-foreground/text-background and
 * wears a rotated rounded-full "Most Popular" sticker chip. CTAs record the
 * selected plan through shared Lakebed conversion state. Use to present Free /
 * Premium / Elite plans for dating apps, singles platforms, or subscription
 * products. Renders fully with no props via baked-in tier defaults.
 */
export const DatingAppPricing = defineCapsule({
  name: 'DatingAppPricing',
  description:
    "Playful-geometric collapsed-border pricing ledger for a dating / matchmaking app backed by shared Lakebed conversion state: an asymmetric header (left-aligned extrabold heading + lede, mono plans meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant extrabold tabular prices, hairline-divided checklists with crossed-out excluded features, and full-width rounded-full pill mutation CTAs with hard offset shadows and press feedback; the featured tier inverts to a dark surface with a rotated rounded-full 'Most Popular' sticker chip. Plans seed command search and every CTA records the selected plan. Use to present Free / Premium / Elite plans for dating apps, singles platforms, or subscription products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
          features: z.array(
            z.object({ label: z.string(), included: z.boolean() }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const pricingHeading = props.heading ?? 'Choose your journey'
    const pricingDesc =
      props.description ??
      "Start free, upgrade when you're ready for more connections."
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            tagline: 'Get started with the basics',
            price: '$0',
            period: '/month',
            cta: 'Get Started',
            featured: false,
            features: [
              { label: '10 likes per day', included: true },
              { label: 'Basic matching', included: true },
              { label: 'Chat with matches', included: true },
              { label: 'See who liked you', included: false },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Unlock your full potential',
            price: '$29',
            period: '/month',
            cta: 'Start Free Trial',
            featured: true,
            badge: 'Most Popular',
            features: [
              { label: 'Unlimited likes', included: true },
              { label: 'See who liked you', included: true },
              { label: 'Advanced filters', included: true },
              { label: 'Video dates included', included: true },
              { label: 'Priority support', included: true },
            ],
          },
          {
            name: 'Elite',
            tagline: 'The ultimate experience',
            price: '$49',
            period: '/month',
            cta: 'Go Elite',
            featured: false,
            features: [
              { label: 'Everything in Premium', included: true },
              { label: 'Profile boost monthly', included: true },
              { label: 'Read receipts', included: true },
              { label: 'Exclusive events access', included: true },
            ],
          },
        ]
    useSyncSaasPlans(
      lakebed,
      pricingTiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline,
        }),
      ),
    )
    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={pricingHeading}
              subtitle={pricingDesc}
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ plans ] cancel anytime
            </MonoTag>
          </div>
          <PricingGrid
            className={cn(
              'gap-0 border-l border-t border-border md:grid-cols-3 xl:grid-cols-3',
              props.className,
            )}
          >
            {pricingTiers.map((tier, index) => {
              const t = tier as {
                name: string
                price: string
                features?: Array<string | { label: string; included: boolean }>
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
              const featureList = Array.isArray(t.features) ? t.features : []
              const included = featureList
                .filter((f) => typeof f === 'string' || f.included !== false)
                .map((f) => (typeof f === 'string' ? f : f.label))
              const excluded = featureList
                .filter((f) => typeof f !== 'string' && f.included === false)
                .map((f) => (typeof f === 'string' ? f : f.label))
                .concat(t.excluded ?? [])
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-4 md:border-2 md:border-foreground md:py-12 md:shadow-[3px_3px_0_0] md:shadow-primary/40'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3.5 right-6 rotate-2 rounded-full border-2 border-foreground bg-background px-4 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'faint'}
                      className="tabular-nums"
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
                      'mt-6 gap-0 divide-y border-t',
                      isFeatured
                        ? 'divide-background/15 border-background/15'
                        : 'divide-border border-border',
                    )}
                  >
                    {included.map((feature) => (
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
                    {excluded.map((feature) => (
                      <PricingTierFeature
                        key={feature}
                        className={cn(
                          'gap-3 py-2.5 line-through [&>svg]:invisible',
                          isFeatured
                            ? 'text-background/40'
                            : 'text-muted-foreground/60',
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[3px_3px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border-2 border-foreground bg-background text-foreground shadow-[3px_3px_0_0] shadow-foreground hover:bg-muted',
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
