import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
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
 * NoCodePricing — block-builder-kinetic collapsed-border pricing ledger for a
 * no-code / app-builder SaaS landing page, backed by shared Lakebed conversion
 * state. An asymmetric header (mono eyebrow, a left-aligned heading with a
 * tilted primary marker block behind the key word, mono meta right) sits above
 * an interactive monthly/yearly rounded-full toggle with a mono "save" chip,
 * then a sharp-cornered, collapsed-border 3-tier ledger: each cell carries a
 * mono plan index, name, blurb, a giant tabular-nums price + period, a
 * hairline-divided feature checklist, and a full-width square CTA with a hard
 * offset shadow and press feedback. The featured tier inverts to
 * bg-foreground/text-background with a rotated "Most Popular" marker chip. Plans
 * seed command search and every CTA records selected plan or sales intent. Use
 * as the pricing section for a no-code / app-builder SaaS or any subscription
 * product. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
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
import { MonoTag } from '#/section-kit/Decor.tsx'
export const NoCodePricing = defineCapsule({
  name: 'NoCodePricing',
  description:
    'Block-builder-kinetic collapsed-border pricing ledger for a no-code / app-builder SaaS landing page backed by shared Lakebed conversion state: an asymmetric header (mono eyebrow, marker-highlighted heading left, mono meta right) above an interactive monthly/yearly toggle, then a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline feature checklists and square hard-shadow mutation CTAs; the featured tier inverts to a dark surface with a rotated Most Popular chip. Plans seed command search and every CTA records selected plan or sales intent. Use as the pricing section for a no-code / app-builder SaaS or any subscription product.',
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Monthly billing toggle label. */
    monthlyLabel: z.string().optional(),
    /** Yearly billing toggle label. */
    yearlyLabel: z.string().optional(),
    /** Savings badge shown beside the yearly label. */
    saveBadge: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string().optional(),
          cta: z.string(),
          features: z.array(z.string()),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const monthlyLabel = props.monthlyLabel ?? 'Monthly'
    const yearlyLabel = props.yearlyLabel ?? 'Yearly'
    const saveBadge = props.saveBadge ?? 'Save 20%'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'Perfect for side projects',
            price: '$0',
            period: '/month',
            cta: 'Start building free',
            features: [
              '3 projects',
              '50+ templates',
              'Buildr subdomain',
              'Community support',
            ],
          },
          {
            name: 'Pro',
            tagline: 'For serious creators',
            price: '$29',
            period: '/month',
            cta: 'Start 14-day trial',
            featured: true,
            badge: 'Most Popular',
            features: [
              'Unlimited projects',
              '200+ templates',
              'Custom domain',
              '10 team members',
              'Priority support',
              'Analytics dashboard',
            ],
          },
          {
            name: 'Enterprise',
            tagline: 'For large organizations',
            price: 'Custom',
            cta: 'Contact sales',
            features: [
              'Everything in Pro',
              'Unlimited team members',
              'SSO & advanced security',
              'Dedicated account manager',
              'Custom SLA',
            ],
          },
        ]
    const isYearly = billing === 'yearly'
    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.period,
          price: plan.price,
          summary: plan.tagline || plan.features.at(0) || '',
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
        aria-labelledby="nc-pricing"
      >
        <Container className="relative">
          {/* Asymmetric header: mono eyebrow, marker heading left, mono meta right. */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · per plan
                </span>
              </MonoTag>
              <h2
                id="nc-pricing"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
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
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            {/* Billing toggle — mono labels + rounded-full sticker switch. */}
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                {monthlyLabel}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle yearly billing"
                onClick={() =>
                  setBilling((current) =>
                    current === 'monthly' ? 'yearly' : 'monthly',
                  )
                }
                className="relative h-7 w-12 rounded-full border border-foreground bg-background p-0.5 transition-colors"
              >
                <span
                  className={cn(
                    'block size-5 rounded-full bg-primary transition-transform',
                    isYearly ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {yearlyLabel}
              </span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                {saveBadge}
              </span>
            </div>
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
              const blurb = t.tagline || t.blurb || t.description || t.audience
              const unit = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
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
                      {(t.excluded ?? []).map((feature) => (
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
                  ) : null}
                  {t.cta ? (
                    <SaasPlanActionButton
                      lakebed={lakebed}
                      intentLabel={t.cta}
                      plan={t.name}
                      source={`pricing-${billing}`}
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
