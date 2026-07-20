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
 * MarketingAgencyPricing — kinetic collapsed-border pricing ledger backed by
 * shared Lakebed conversion state. An asymmetric header (marker-highlighted
 * heading left, mono "[ PRICING ]" meta right) sits above a sharp-cornered,
 * collapsed-border 3-tier ledger: each cell carries a mono plan index, name,
 * audience line, a giant tabular-nums price + period, a hairline-divided feature
 * checklist (included rows get a primary check, excluded rows render struck/muted
 * with the check hidden), and a full-width square CTA with hard offset shadow and
 * press feedback that records selected plan / sales intent. The featured tier
 * inverts to bg-foreground/text-background with a rotated "Most Popular" chip, and
 * a reassurance note sits below. Use to present retainer / service tiers for a
 * marketing or growth agency. Renders fully with no props.
 */
export const MarketingAgencyPricing = defineCapsule({
  name: 'MarketingAgencyPricing',
  description:
    'Kinetic collapsed-border pricing ledger for a marketing / growth agency backed by shared Lakebed conversion state: an asymmetric header (marker-highlighted heading left, mono pricing meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, hairline feature checklists (included checks + struck-out exclusions), and square hard-shadow mutation CTAs; the featured tier inverts to a dark surface with a rotated Most Popular chip, and a reassurance note sits below. Plans seed command search and every CTA records selected plan or sales intent. Use to present retainer / service tiers for a marketing or growth agency.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    note: z.string().optional(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          audience: z.string(),
          price: z.string(),
          period: z.string().optional(),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
          /** Features with `included: false` rendered struck/muted. */
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
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Simple, Transparent Pricing'
    const description =
      props.description ??
      'No hidden fees. No long-term contracts. Cancel anytime.'
    const note =
      props.note ??
      'All plans include a 30-day money-back guarantee. No questions asked.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            audience: 'For early-stage startups',
            price: '$3,500',
            period: '/month',
            cta: 'Get Started',
            featured: false,
            features: [
              {
                label: '1 channel (SEO or Paid)',
                included: true,
              },
              {
                label: 'Monthly reporting',
                included: true,
              },
              {
                label: 'Email support',
                included: true,
              },
              {
                label: '$10K monthly ad spend',
                included: true,
              },
              {
                label: 'CRO & landing pages',
                included: false,
              },
              {
                label: 'Dedicated strategist',
                included: false,
              },
            ],
          },
          {
            name: 'Growth',
            audience: 'For scaling companies',
            price: '$7,500',
            period: '/month',
            cta: 'Get Started',
            featured: true,
            badge: 'Most Popular',
            features: [
              {
                label: '3 channels included',
                included: true,
              },
              {
                label: 'Weekly reporting',
                included: true,
              },
              {
                label: 'Priority support',
                included: true,
              },
              {
                label: '$50K monthly ad spend',
                included: true,
              },
              {
                label: 'CRO & landing pages',
                included: true,
              },
              {
                label: 'Dedicated strategist',
                included: true,
              },
            ],
          },
          {
            name: 'Enterprise',
            audience: 'For established brands',
            price: 'Custom',
            cta: 'Contact Sales',
            featured: false,
            features: [
              {
                label: 'All channels included',
                included: true,
              },
              {
                label: 'Real-time dashboard',
                included: true,
              },
              {
                label: '24/7 support',
                included: true,
              },
              {
                label: 'Unlimited ad spend',
                included: true,
              },
              {
                label: 'Full creative team',
                included: true,
              },
              {
                label: 'Quarterly business reviews',
                included: true,
              },
            ],
          },
        ]
    useSyncSaasPlans(
      lakebed,
      plans.map((plan) =>
        saasPlan({
          name: plan.name,
          period: plan.period ?? '',
          price: plan.price,
          summary: plan.audience || plan.features.at(0)?.label || '',
        }),
      ),
    )
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · retainers
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
              <p className="mt-4 text-lg text-muted-foreground">
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
              const isFeatured = Boolean(tier.featured)
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
                      {tier.badge ?? 'Most Popular'}
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
                    <PricingTierTagline
                      className={cn(
                        'mt-2',
                        isFeatured ? 'text-background/70' : undefined,
                      )}
                    >
                      {tier.audience}
                    </PricingTierTagline>
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
                    {tier.features.map((feature) =>
                      feature.included ? (
                        <PricingTierFeature
                          key={feature.label}
                          className={cn(
                            'gap-3 py-2.5',
                            isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85',
                          )}
                        >
                          {feature.label}
                        </PricingTierFeature>
                      ) : (
                        <PricingTierFeature
                          key={feature.label}
                          className={cn(
                            'gap-3 py-2.5 line-through [&>svg]:invisible',
                            isFeatured
                              ? 'text-background/40'
                              : 'text-muted-foreground/60',
                          )}
                        >
                          {feature.label}
                        </PricingTierFeature>
                      ),
                    )}
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
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {note}
          </p>
        </Container>
      </section>
    )
  },
})
