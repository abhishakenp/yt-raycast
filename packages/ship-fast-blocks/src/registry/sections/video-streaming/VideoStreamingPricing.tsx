import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * VideoStreamingPricing — a dark-cinematic collapsed-border plan ledger for a
 * video-streaming landing page, backed by shared Lakebed conversion state. A
 * mono slate meta rule + asymmetric left header sits above a sharp-cornered,
 * collapsed-border 3-tier ledger: each cell carries a mono plan index, name, a
 * giant tabular-nums monthly price, a hairline-divided checkmark feature list,
 * and a full-width square CTA with a hard offset token shadow and press
 * feedback. The featured tier (Standard) inverts to bg-foreground/text-background
 * and lifts with a rotated mono "Popular" chip. Plans seed command search and
 * every CTA records the selected plan to Lakebed state. Use to present
 * subscription tiers — Basic, Standard, Premium — for a streaming service or OTT
 * app. Renders fully with no props via baked-in defaults.
 */
export const VideoStreamingPricing = defineCapsule({
  name: 'VideoStreamingPricing',
  description:
    "A dark-cinematic collapsed-border plan ledger for a video-streaming landing page backed by shared Lakebed conversion state: a mono slate meta rule + asymmetric left header above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums monthly prices, hairline-divided checkmark feature lists, and square hard-shadow mutation CTAs with press feedback; the featured tier (Standard) inverts to a dark surface and lifts with a rotated mono 'Popular' chip. Plans seed command search and every CTA records the selected plan. Use to present subscription tiers — Basic, Standard, Premium — for a streaming service or OTT app.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers (supply exactly 3); mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Pick your plan'
    const subheading =
      props.subheading ??
      'Every plan includes the full catalog and zero ads. Upgrade for sharper quality and more screens — cancel anytime.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Basic',
            price: '$8',
            period: '/mo',
            features: [
              'Full catalog, zero ads',
              'HD (720p) streaming',
              'Watch on 1 screen',
              'Offline downloads',
            ],
            cta: 'Choose plan',
            highlighted: false,
          },
          {
            name: 'Standard',
            price: '$14',
            period: '/mo',
            features: [
              'Everything in Basic',
              'Full HD (1080p) streaming',
              'Watch on 2 screens at once',
              'Up to 5 profiles',
              'Offline on any device',
            ],
            cta: 'Choose plan',
            highlighted: true,
          },
          {
            name: 'Premium',
            price: '$20',
            period: '/mo',
            features: [
              'Everything in Standard',
              '4K Ultra HD + HDR',
              'Watch on 4 screens at once',
              'Dolby Atmos sound',
              'Early access to originals',
            ],
            cta: 'Choose plan',
            highlighted: false,
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.features.at(0) ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pb-20 pt-24 lg:pb-28 lg:pt-32',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Plans
            </span>
            <span className="tabular-nums">
              billed monthly · cancel anytime
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={subheading}
            className="mb-12 gap-0"
            titleClassName="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
            subtitleClassName="max-w-2xl"
          />

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
                      Popular
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
                    <span className="mt-6 flex items-baseline gap-1.5">
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
