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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * CybersecurityPricing — terminal-stealth clearance-tier ledger. A muted-wash
 * band opening with a hairline mono meta rule ("PRICING LEDGER" + tabular tier
 * count) above an asymmetric header (left-aligned heading + lede, mono
 * clearance tag right). Tiers render as a square-edged, collapsed-border
 * ledger grid: each cell carries a mono tier index, bold name, blurb, a giant
 * tabular price with mono period, a hairline rule, and a check feature list.
 * The featured tier fully inverts to the ink surface with a mono
 * "[ MOST POPULAR ]" chip and hard-offset CTA shadow. Every CTA is a scoped
 * Lakebed plan-action button with press feedback. Use to present subscription
 * tiers for cybersecurity vendors, SOC/MDR providers, or any B2B security
 * SaaS. Renders fully with no props via baked-in Starter / Professional /
 * Enterprise defaults.
 */
export const CybersecurityPricing = defineCapsule({
  name: 'CybersecurityPricing',
  description:
    'Terminal-stealth clearance-tier pricing ledger backed by shared Lakebed conversion state: a mono meta rule and asymmetric left-aligned header above a square-edged, collapsed-border tier grid with giant tabular prices; the featured tier inverts to the ink surface with a mono badge and hard-offset CTA. Plans seed command search and each CTA records selected plan or sales intent with scoped loading and press feedback. Use to present subscription tiers for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Pricing plans (set featured + badge on the highlighted tier). */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
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
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Choose the plan that fits your security needs. All plans include our core AI detection engine.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            blurb: 'For small teams getting started with security',
            price: '$999',
            period: '/month',
            cta: 'Start free trial',
            features: [
              'Up to 100 endpoints',
              'Email support (business hours)',
              'Basic threat detection',
              'Weekly security reports',
              '1 cloud account',
            ],
          },
          {
            name: 'Professional',
            blurb: 'For growing companies with complex infrastructure',
            price: '$4,999',
            period: '/month',
            cta: 'Start free trial',
            featured: true,
            badge: 'MOST POPULAR',
            features: [
              'Up to 1,000 endpoints',
              '24/7 phone & email support',
              'Advanced AI threat detection',
              'Real-time security dashboard',
              '5 cloud accounts',
              'Compliance reporting (SOC 2, ISO)',
              'API access',
            ],
          },
          {
            name: 'Enterprise',
            blurb: 'For large organizations with custom requirements',
            price: 'Custom',
            cta: 'Contact sales',
            features: [
              'Unlimited endpoints',
              'Dedicated account manager',
              'Custom AI model training',
              'Unlimited cloud accounts',
              'On-premise deployment option',
              'Custom SLA & response times',
              'White-glove onboarding',
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
          summary: plan.blurb || plan.features.at(0) || '',
        }),
      ),
    )

    return (
      <section
        className={cn('bg-muted/40 py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-10">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Pricing ledger
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {String(plans.length).padStart(2, '0')} tiers
            </span>
          </div>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ clearance: select one ]
            </p>
          </div>
          <PricingGrid className="grid-cols-1 gap-0 border-l border-t border-border md:grid-cols-3 xl:grid-cols-3">
            {plans.map((tier, tierIndex) => {
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
              const featured = Boolean(t.highlighted || t.featured || t.popular)
              const period = t.period ?? t.unit ?? t.cadence ?? t.suffix
              return (
                <PricingTier
                  key={t.name}
                  variant={featured ? 'highlighted' : undefined}
                  className={cn(
                    'gap-5 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8',
                    featured
                      ? 'relative border-foreground bg-foreground text-background ring-0 max-md:z-10 max-md:-mx-2 max-md:border max-md:shadow-[6px_6px_0_0] max-md:shadow-foreground/25'
                      : 'bg-background',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums',
                      featured
                        ? 'text-background/50'
                        : 'text-muted-foreground/60',
                    )}
                  >
                    Tier {String(tierIndex + 1).padStart(2, '0')}
                  </span>
                  {featured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rounded-none bg-primary font-mono text-[10px] uppercase tracking-[0.15em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground/30">
                      [ {t.badge ?? 'Popular'} ]
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-2">
                    <PricingTierName
                      className={cn(
                        'text-xl font-bold tracking-tight',
                        featured && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={featured ? 'text-background/60' : undefined}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={featured ? 'text-background/60' : undefined}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={featured ? 'text-background/60' : undefined}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={featured ? 'text-background/60' : undefined}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <span className="mt-2 flex flex-wrap items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl md:text-3xl lg:text-4xl xl:text-5xl',
                          featured && 'text-background',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {period && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-xs uppercase tracking-[0.15em]',
                            featured && 'text-background/60',
                          )}
                        >
                          {period}
                        </PricingTierPeriod>
                      )}
                    </span>
                  </PricingTierHeader>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-px w-full',
                      featured ? 'bg-background/20' : 'bg-border',
                    )}
                  />
                  {t.features && (
                    <PricingTierFeatures className="gap-2.5">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(
                            'gap-2.5 text-sm leading-6',
                            featured
                              ? 'text-background/75 [&>svg]:text-background'
                              : 'text-muted-foreground [&>svg]:text-foreground',
                          )}
                        >
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
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                        featured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/25 hover:bg-background/90 active:shadow-none'
                          : 'border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-muted',
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
