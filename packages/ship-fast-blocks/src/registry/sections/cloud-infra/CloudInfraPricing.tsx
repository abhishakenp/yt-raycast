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
 * CloudInfraPricing — terminal-industrial usage-based pricing ledger for a
 * cloud-infrastructure / developer-platform SaaS landing page. An asymmetric
 * header (left-aligned heading + description, mono billing meta right) above a
 * collapsed-border 3-tier rate ledger: square-cornered hairline-separated
 * cells with mono tier index tags, giant extrabold tabular prices with mono
 * unit labels, hairline feature rows, and scoped Lakebed plan CTAs with press
 * feedback. The popular tier is a full bg-foreground/text-background inversion
 * with a mono `[ popular ]` stamp. An optional enterprise reserved-capacity
 * panel renders below when enterprise props are provided. Tokens-only.
 * Renders fully on zero arguments.
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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const CloudInfraPricing = defineCapsule({
  name: 'CloudInfraPricing',
  description:
    'Terminal-industrial usage-based pricing ledger for a cloud-infrastructure / developer-platform SaaS landing page backed by shared Lakebed conversion state: an asymmetric header above a collapsed-border 3-tier rate ledger with mono tier index tags, giant tabular prices, hairline feature rows, and scoped plan CTAs that seed command search and record conversion intent. The popular tier is fully inverted with a mono stamp; an enterprise reserved-capacity panel renders below when enterprise props are provided. Use for pricing sections on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers: name, tagline, price, unit, features, and optional popular flag. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string().optional(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    /** Enterprise panel heading. */
    enterpriseHeading: z.string().optional(),
    /** Enterprise panel description. */
    enterpriseDescription: z.string().optional(),
    /** Enterprise commitment items (e.g. '1-year: 15% discount'). */
    enterpriseItems: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Usage-based pricing that scales'
    const description =
      props.description ??
      'Pay only for what you use. No minimums, no upfront commitments, no surprise bills.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Compute',
            tagline: 'Virtual machines and containers',
            price: '$0.004',
            unit: '/ vCPU-hour',
            features: [
              'Shared CPU instances from 1 vCPU / 512 MB',
              'Dedicated CPU at $0.028/vCPU-hour',
              'GPU instances (NVIDIA A100) at $2.50/hour',
              'Auto-scaling with per-second billing',
            ],
            cta: 'Start Compute',
          },
          {
            name: 'Serverless',
            tagline: 'Functions and edge computing',
            price: '$0.15',
            unit: '/ million requests',
            popular: true,
            features: [
              'First 1M requests free every month',
              '$0.0001 per GB-second of compute',
              '128 MB to 8 GB memory tiers',
              'Global edge deployment included',
            ],
            cta: 'Start Free',
          },
          {
            name: 'Storage & Data',
            tagline: 'Databases, caches, and object storage',
            price: '$0.10',
            unit: '/ GB-month',
            features: [
              'Managed PostgreSQL and MySQL',
              'Redis cache from $15/month',
              'Object storage with free egress',
              'Automated daily backups included',
            ],
            cta: 'Start Storage',
          },
        ]
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.unit,
          price: tier.price,
          summary: tier.tagline,
        }),
      ),
    )
    const hasEnterprise = Boolean(
      props.enterpriseHeading ||
      props.enterpriseDescription ||
      props.enterpriseItems?.length,
    )
    return (
      <section
        className={cn('bg-muted/40 py-14 sm:py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-base sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ billing ] per-second metering
            </p>
          </div>
          <PricingGrid className="gap-px border border-border bg-border md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, tierIndex) => {
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
              const inverted = Boolean(t.highlighted || t.featured || t.popular)
              return (
                <PricingTier
                  key={t.name}
                  variant={inverted ? 'highlighted' : undefined}
                  className={cn(
                    'gap-5 rounded-none border-0 p-5 shadow-none ring-0 sm:p-7',
                    inverted
                      ? 'bg-foreground text-background'
                      : 'bg-background',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-mono text-[10px] uppercase tracking-[0.2em]',
                        inverted
                          ? 'text-background/50'
                          : 'text-muted-foreground/70',
                      )}
                    >
                      rate / {`0${tierIndex + 1}`.slice(-2)}
                    </span>
                    {inverted ? (
                      <PricingTierBadge className="rounded-none bg-background px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-1.5 bg-primary opacity-40"
                      />
                    )}
                  </div>
                  <PricingTierHeader className="gap-1.5">
                    <PricingTierName
                      className={cn(
                        'text-lg font-semibold tracking-tight',
                        inverted && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(
                          'text-sm',
                          inverted && 'text-background/60',
                        )}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(inverted && 'text-background/60')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(inverted && 'text-background/60')}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(inverted && 'text-background/60')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <PricingTierPrice
                      className={cn(
                        'mt-3 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl',
                        inverted && 'text-background',
                      )}
                    >
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.14em]',
                          inverted && 'text-background/50',
                        )}
                      >
                        {t.period}
                      </PricingTierPeriod>
                    )}
                    {t.unit && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.14em]',
                          inverted && 'text-background/50',
                        )}
                      >
                        {t.unit}
                      </PricingTierPeriod>
                    )}
                    {t.cadence && (
                      <PricingTierPeriod
                        className={cn(inverted && 'text-background/50')}
                      >
                        {t.cadence}
                      </PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod
                        className={cn(inverted && 'text-background/50')}
                      >
                        {t.suffix}
                      </PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-0 divide-y',
                        inverted ? 'divide-background/10' : 'divide-border',
                      )}
                    >
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(
                            'py-2.5 text-sm',
                            inverted &&
                              'text-background/70 [&_svg]:text-background/50',
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
                        'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-none px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                        inverted
                          ? 'bg-background text-foreground hover:bg-background/90'
                          : 'border border-foreground/25 bg-background text-foreground hover:border-foreground',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
          {hasEnterprise && (
            <div className="mt-8 border border-border bg-background p-6 [clip-path:polygon(0_0,100%_0,100%_calc(100%-1rem),calc(100%-1rem)_100%,0_100%)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  {props.enterpriseHeading && (
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {props.enterpriseHeading}
                    </h3>
                  )}
                  {props.enterpriseDescription && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {props.enterpriseDescription}
                    </p>
                  )}
                </div>
                {props.enterpriseItems?.length ? (
                  <ul className="flex flex-col gap-2 lg:items-end">
                    {props.enterpriseItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="size-1.5 bg-primary"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          )}
        </Container>
      </section>
    )
  },
})
