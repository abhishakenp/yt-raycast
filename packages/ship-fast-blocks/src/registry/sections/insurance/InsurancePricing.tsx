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
 * InsurancePricing — Swiss-trust collapsed-border pricing ledger for an
 * insurance page backed by shared Lakebed conversion state. On a soft muted
 * canvas: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono
 * plans meta right) sits above a sharp-cornered, collapsed-border 3-tier ledger
 * whose cells share hairline rules; each cell carries a mono plan index, name,
 * tagline, a giant tabular-nums monthly price with a mono period, a hairline-
 * divided feature checklist with crossed-out excluded rows, and a full-width
 * square mutation CTA with a hard offset shadow and mechanical press feedback.
 * The "Most Popular" tier inverts to bg-foreground / text-background with a
 * square badge. Plans seed the command search and every CTA records the selected
 * plan or sales intent to Lakebed. Use as the pricing section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
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
export const InsurancePricing = defineCapsule({
  name: 'InsurancePricing',
  description:
    "Swiss-trust collapsed-border pricing ledger for an insurance page backed by shared Lakebed conversion state: on a soft muted canvas, an asymmetric header (mono eyebrow + left-aligned heading + lede, mono plans meta right) above a sharp 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums monthly prices, hairline feature checklists with crossed-out exclusions, and square hard-shadow mutation CTAs with press feedback; the 'Most Popular' tier inverts to a dark surface with a square badge. Plans seed command search and every CTA records the selected plan or sales intent. Use as the pricing section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Badge label shown on the popular plan. */
    popularLabel: z.string().optional(),
    /** Pricing plans. */
    plans: z
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
    const eyebrow = props.eyebrow ?? 'Transparent Pricing'
    const heading = props.heading ?? 'Simple, upfront pricing'
    const description =
      props.description ??
      "No hidden fees, no surprises. Choose the coverage level that's right for you."
    const popularLabel = props.popularLabel ?? 'Most Popular'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Essential',
            tagline: 'Basic coverage for budget-conscious families',
            price: '$89',
            period: '/month',
            cta: 'Get Started',
            popular: false,
            features: [
              {
                label: '$100K liability coverage',
                included: true,
              },
              {
                label: '$500 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: false,
              },
            ],
          },
          {
            name: 'Complete',
            tagline: 'Comprehensive protection for peace of mind',
            price: '$149',
            period: '/month',
            cta: 'Get Started',
            popular: true,
            features: [
              {
                label: '$500K liability coverage',
                included: true,
              },
              {
                label: '$250 deductible',
                included: true,
              },
              {
                label: '24/7 claims support',
                included: true,
              },
              {
                label: 'Identity theft protection',
                included: true,
              },
              {
                label: 'Personal umbrella policy',
                included: true,
              },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Maximum protection for high-value assets',
            price: '$229',
            period: '/month',
            cta: 'Contact Sales',
            popular: false,
            features: [
              {
                label: '$1M liability coverage',
                included: true,
              },
              {
                label: '$100 deductible',
                included: true,
              },
              {
                label: 'Priority claims processing',
                included: true,
              },
              {
                label: 'Full identity restoration',
                included: true,
              },
              {
                label: 'Dedicated agent',
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
          period: plan.period,
          price: plan.price,
          summary: plan.tagline || plan.features.at(0)?.label || '',
        }),
      ),
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-20 lg:py-28',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / no hidden fees
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
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
              [ {String(plans.length).padStart(2, '0')} plans ] billed monthly
            </MonoTag>
          </div>
          <PricingGrid className="gap-0 border-l border-t border-border md:grid-cols-3 xl:grid-cols-3">
            {plans.map((tier, index) => {
              const included = tier.features.filter((f) => f.included)
              const excluded = tier.features.filter((f) => !f.included)
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
                    <PricingTierTagline
                      className={cn(
                        'mt-2',
                        isFeatured ? 'text-background/70' : undefined,
                      )}
                    >
                      {tier.tagline}
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
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.12em]',
                          isFeatured ? 'text-background/60' : undefined,
                        )}
                      >
                        {tier.period}
                      </PricingTierPeriod>
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
                    ))}
                    {excluded.map((feature) => (
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
