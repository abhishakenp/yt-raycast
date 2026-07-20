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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
 * AeoPricing — "Answer Terminal" three-tier pricing strip for an Answer-Engine-
 * Optimization (AEO) SaaS. A left-aligned header with a mono index eyebrow sits
 * above a collapsed-border rounded-none comparison strip: Starter, Growth, and
 * Enterprise cells with giant tabular prices, mono "+"-prefixed feature lists,
 * and scoped fullstack CTAs that record plan intent through Lakebed. The
 * highlighted tier flips to a full bg-foreground/text-background inversion and
 * wears a rotated "Popular" sticker chip. Plans seed the command search catalog
 * and selected tiers update shared conversion state. Use to convert prospects
 * on AEO, generative-search visibility, or brand-citation analytics pages.
 * Renders fully with no props via baked-in defaults.
 */
export const AeoPricing = defineCapsule({
  name: 'AeoPricing',
  description:
    "Terminal-styled three-tier pricing for an Answer-Engine-Optimization (AEO) product backed by shared Lakebed conversion state: a left-aligned mono-labeled header above a collapsed-border rounded-none comparison strip of Starter, Growth (fully inverted dark cell with a rotated 'Popular' sticker), and Enterprise tiers, each with a giant tabular price, a mono '+'-prefixed feature list, and a scoped fullstack CTA. Plans seed the command search catalog and selected tiers update shared conversion state. Use to convert prospects on AEO, generative-search visibility, or brand-citation analytics landing pages.",
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
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$49',
            period: '/mo',
            features: [
              '1 brand, 50 tracked prompts',
              'ChatGPT & Perplexity tracking',
              'Weekly citation reports',
              'Core optimization recommendations',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
          },
          {
            name: 'Growth',
            price: '$199',
            period: '/mo',
            features: [
              '3 brands, 500 tracked prompts',
              'All answer engines incl. AI Overviews',
              'Share-of-voice & competitor tracking',
              'Change alerts & prompt opportunities',
              'Priority support',
            ],
            cta: 'Start Free',
            ctaTarget: 'Start Free',
            highlighted: true,
          },
          {
            name: 'Enterprise',
            price: 'Custom',
            features: [
              'Unlimited brands & prompts',
              'API access & data exports',
              'Dedicated strategist & SSO',
              'Custom integrations & SLAs',
              'Executive reporting',
            ],
            cta: 'Book demo',
            ctaTarget: 'Book demo',
          },
        ]
    const heading =
      props.heading ?? 'Pricing that scales with your AI visibility'
    const subheading =
      props.subheading ??
      'Start free, then upgrade as you track more prompts, brands, and answer engines. No setup fees.'

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
      <section
        className={cn('bg-background py-14 sm:py-20 lg:py-28', props.className)}
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              title={heading}
              subtitle={subheading}
              align="left"
              eyebrow="03 / Pricing"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="tracking-tight"
              subtitleClassName="leading-7"
              className="max-w-2xl gap-2"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              $ citeable --plans
            </p>
          </div>

          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0">
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
              const highlighted = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              return (
                <PricingTier
                  key={`${t.name}-${index}`}
                  variant={highlighted ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-none border-0 border-b border-r border-border shadow-none md:last:odd:col-span-2 xl:last:odd:col-span-1',
                    highlighted
                      ? 'bg-foreground text-background ring-0 max-md:z-10 max-md:-mx-2 max-md:border max-md:border-foreground max-md:shadow-[6px_6px_0_0] max-md:shadow-foreground/25'
                      : 'bg-card',
                  )}
                >
                  {highlighted ? (
                    <PricingTierBadge className="absolute -top-3 right-5 rotate-3 bg-primary font-mono text-[10px] uppercase tracking-[0.12em] shadow-[3px_3px_0_0] shadow-background/30">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em]',
                      highlighted
                        ? 'text-background/50'
                        : 'text-muted-foreground',
                    )}
                  >
                    tier {String(index + 1).padStart(2, '0')}
                  </span>
                  <PricingTierHeader>
                    <PricingTierName
                      className={cn(
                        'tracking-tight',
                        highlighted && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(highlighted && 'text-background/60')}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(highlighted && 'text-background/60')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(highlighted && 'text-background/60')}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(highlighted && 'text-background/60')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-semibold tracking-tight tabular-nums',
                          highlighted && 'text-background',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-xs uppercase tracking-[0.14em]',
                            highlighted && 'text-background/60',
                          )}
                        >
                          {t.period}
                        </PricingTierPeriod>
                      )}
                      {t.unit && (
                        <PricingTierPeriod
                          className={cn(highlighted && 'text-background/60')}
                        >
                          {t.unit}
                        </PricingTierPeriod>
                      )}
                      {t.cadence && (
                        <PricingTierPeriod
                          className={cn(highlighted && 'text-background/60')}
                        >
                          {t.cadence}
                        </PricingTierPeriod>
                      )}
                      {t.suffix && (
                        <PricingTierPeriod
                          className={cn(highlighted && 'text-background/60')}
                        >
                          {t.suffix}
                        </PricingTierPeriod>
                      )}
                    </div>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-2.5 border-t pt-5',
                        highlighted ? 'border-background/15' : 'border-border',
                      )}
                    >
                      {t.features.map((feature, featureIndex) => (
                        <PricingTierFeature
                          key={`${
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }-${featureIndex}`}
                          className={cn(
                            'gap-2 font-mono text-xs leading-5 [&>svg]:hidden',
                            highlighted
                              ? 'text-background/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="shrink-0 font-semibold text-primary"
                          >
                            +
                          </span>
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
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:translate-y-px motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70',
                        highlighted
                          ? 'bg-primary text-primary-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-primary/90 active:shadow-none'
                          : 'border border-border bg-background text-foreground hover:bg-foreground hover:text-background',
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
