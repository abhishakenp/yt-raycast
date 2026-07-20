import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { z } from 'zod/v4'

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
 * OnlineCoursePricing — "Curriculum LMS" collapsed-border enrollment ledger for
 * an online-course page, backed by shared Lakebed conversion state. An
 * asymmetric header (left-aligned heading with a tilted primary marker block
 * behind the key word, mono "[ enroll ]" meta on the right) sits above a
 * sharp-cornered, collapsed-border 3-tier ledger: each cell carries a mono plan
 * index, name, a giant tabular-nums price, a hairline-divided checkmark feature
 * list, and a full-width square CTA with a hard offset token shadow and press
 * feedback. The highlighted tier inverts to bg-foreground / text-background
 * with a rotated "Popular" marker chip. Plans seed command search and every CTA
 * records the selected plan to Lakebed. Use to present enrollment options —
 * Free Audit, Pro, Team — on an e-learning, bootcamp, or academy landing page.
 * Renders fully with no props via baked-in defaults.
 */
export const OnlineCoursePricing = defineCapsule({
  name: 'OnlineCoursePricing',
  description:
    'Curriculum-LMS collapsed-border enrollment ledger for an online-course page backed by shared Lakebed conversion state: an asymmetric header (marker-highlighted heading left, mono enroll meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline checkmark feature lists, and square hard-shadow mutation CTAs; the highlighted tier inverts to a dark surface with a rotated Popular chip. Plans seed command search and every CTA records the selected plan. Use to present enrollment options — Free Audit, Pro, Team — on an e-learning, bootcamp, or academy landing page.',
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
    const heading = props.heading ?? 'Enroll your way'
    const subheading =
      props.subheading ??
      'Start free to preview the course, go Pro for the full certificate path, or bring your whole team.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free Audit',
            price: '$0',
            period: '',
            features: [
              'First module unlocked',
              'Community read access',
              'No certificate',
              'Cancel anytime',
            ],
            cta: 'Start free',
            highlighted: false,
          },
          {
            name: 'Pro',
            price: '$149',
            period: 'one-time',
            features: [
              'All modules & projects',
              'Certificate of completion',
              'Full community access',
              'Downloadable resources',
              'Lifetime updates',
            ],
            cta: 'Enroll now',
            highlighted: true,
          },
          {
            name: 'Team',
            price: '$99',
            period: 'per seat',
            features: [
              'Everything in Pro',
              '5+ seats',
              'Team progress dashboard',
              'Priority mentor support',
              'Invoicing & SSO',
            ],
            cta: 'Enroll now',
            highlighted: false,
          },
        ]
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period ?? '',
          price: tier.price,
          summary: tier.features.at(0) ?? '',
        }),
      ),
    )
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Enrollment
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · per learner
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ enroll ] certificate path
            </p>
          </div>

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
