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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * DevToolPricing — terminal-ledger pricing table for a developer tool / API
 * platform. A muted band with an asymmetric header (heading + intro left,
 * aria-hidden mono "[ pricing ] --monthly" meta right) above a sharp-cornered,
 * collapsed-border 3-tier ledger: each cell carries an aria-hidden mono
 * "$ plan --slug" prompt, the plan name, tagline, a giant tabular-nums mono
 * price + mono period, a hairline-divided feature checklist, and a full-width
 * square mutation CTA with hard offset shadow and press feedback. The featured
 * tier inverts to bg-foreground/text-background with a square mono "[ popular ]"
 * chip. Plans seed the command search catalog and each CTA records scoped
 * sign-up or sales intent with local loading. Use to present subscription
 * tiers for developer tools, API platforms, backend-as-a-service, or
 * technical SaaS.
 */
export const DevToolPricing = defineCapsule({
  name: 'DevToolPricing',
  description:
    "Terminal-ledger pricing table for a developer tool / API platform backed by shared Lakebed conversion state: an asymmetric header (heading + intro left, aria-hidden mono '--monthly' meta right) above a sharp collapsed-border 3-tier ledger with mono '$ plan --slug' prompts, giant tabular-nums mono prices, hairline feature checklists, and square hard-shadow mutation CTAs; the featured tier inverts to a dark surface with a square mono '[ popular ]' chip. Plans seed the command search catalog; each CTA records scoped sign-up or sales intent with local loading. Use to present subscription tiers for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
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
      'Start free, scale as you grow. No hidden fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            tagline: 'For side projects and learning',
            price: '$0',
            period: '/month',
            features: [
              '10,000 API requests/month',
              '1 GB storage',
              'Community support',
              '3 team members',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For production applications',
            price: '$29',
            period: '/month',
            features: [
              '500,000 API requests/month',
              '50 GB storage',
              'Priority email support',
              '15 team members',
              'Custom domains & SSL',
            ],
            cta: 'Start Free Trial',
            featured: true,
          },
          {
            name: 'Enterprise',
            tagline: 'For large-scale teams',
            price: 'Custom',
            features: [
              'Unlimited API requests',
              'Unlimited storage',
              '24/7 phone & Slack support',
              'Unlimited team members',
              'SSO, audit logs, SLAs',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period,
          price: tier.price,
          summary: tier.tagline,
        }),
      ),
    )

    return (
      <section
        className={cn('bg-muted/40 py-16 lg:py-24', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-4"
              titleId="pricing-heading"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ pricing ] --monthly
            </MonoTag>
          </div>
          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier) => {
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
              const flag =
                '--' +
                t.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none ring-0 sm:p-7 lg:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-10'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground shadow-[3px_3px_0_0] shadow-background/30">
                      [ {props.popularLabel ?? t.badge ?? 'Popular'} ]
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <p
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.16em]',
                        isFeatured
                          ? 'text-background/60'
                          : 'text-muted-foreground',
                      )}
                    >
                      <span
                        className={
                          isFeatured ? 'text-background' : 'text-primary'
                        }
                      >
                        ${' '}
                      </span>
                      plan {flag}
                    </p>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-bold tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {blurb && (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {blurb}
                      </PricingTierTagline>
                    )}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'font-mono text-5xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {unit && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {unit}
                        </PricingTierPeriod>
                      )}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
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
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className={cn(
                            'gap-3 py-2.5',
                            isFeatured
                              ? 'text-background/85 [&>svg]:text-background'
                              : 'text-foreground/85',
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
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
