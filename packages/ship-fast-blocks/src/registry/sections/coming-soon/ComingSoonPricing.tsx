import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ComingSoonPricing — kinetic three-tier pricing ledger for a "launching soon" /
 * waitlist pre-launch landing page. A left-aligned mono-eyebrow header above a
 * responsive grid of sharp-cornered bordered plan cards with giant tabular
 * price numerals, mono uppercase plan names, hairline-divided feature
 * checklists, and full-width square CTAs with press feedback. The featured
 * plan is fully inverted (bg-foreground/text-background) with a hard offset
 * shadow and a square mono badge. All CTA buttons route through section-kit
 * route links. Use as the pricing / plans section on SaaS waitlists, app
 * pre-launch pages, or beta sign-up landers. Renders fully with no props via
 * three baked-in default plans.
 */
export const ComingSoonPricing = defineCapsule({
  name: 'ComingSoonPricing',
  description:
    "Kinetic three-tier pricing ledger for a 'launching soon' / waitlist pre-launch landing page: left-aligned mono-eyebrow header above a responsive 1/3-column grid of sharp-cornered bordered plan cards with giant tabular price numerals, mono uppercase plan names, hairline-divided feature checklists, and full-width square CTA buttons with press feedback. The featured plan is fully inverted (dark band treatment) with a hard offset shadow and square mono badge. CTAs route through section-kit route links. Use as the pricing / plans section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Choose the plan that fits your team. All plans include a 14-day free trial.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'For small teams getting started',
            price: '$0',
            period: '/month',
            features: [
              'Up to 5 team members',
              '10GB storage',
              'Basic integrations',
              'Community support',
            ],
            cta: 'Get started free',
            featured: false,
          },
          {
            name: 'Pro',
            tagline: 'For growing teams',
            price: '$12',
            period: '/user/month',
            features: [
              'Unlimited team members',
              '100GB storage',
              'Advanced integrations',
              'Priority support',
              'Analytics dashboard',
            ],
            cta: 'Start 14-day trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            tagline: 'For large organizations',
            price: '$49',
            period: '/user/month',
            features: [
              'Everything in Pro',
              'Unlimited storage',
              'SSO & SCIM',
              'Custom contracts',
              'Dedicated success manager',
            ],
            cta: 'Contact sales',
            featured: false,
          },
        ]

    return (
      <section
        className={cn(
          'w-full px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28 xl:px-12',
          props.className,
        )}
      >
        <Container size="md">
          <PricingGrid className="gap-6 [&>[data-slot=section-heading]]:mb-8">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-4"
              titleClassName="text-4xl font-extrabold uppercase leading-[0.92] tracking-tighter text-foreground sm:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground"
            />
            {plans
              .map((plan) => ({
                name: plan.name,
                price: plan.price,
                period: plan.period,
                features: plan.features,
                cta: plan.cta,
                highlighted: plan.featured,
                badge: plan.badge,
                tagline: plan.tagline,
              }))
              .map((tier) => {
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
                const inverted = t.highlighted || t.featured || t.popular
                return (
                  <PricingTier
                    key={t.name}
                    variant={inverted ? 'highlighted' : undefined}
                    className={cn(
                      'gap-6 rounded-none p-6 shadow-none sm:p-7 lg:p-8',
                      inverted
                        ? 'border-2 border-foreground bg-foreground text-background shadow-[8px_8px_0_0] shadow-primary/40 ring-0 lg:-translate-y-4'
                        : 'border-2 border-foreground/15 bg-background transition-colors duration-150 hover:border-foreground',
                    )}
                  >
                    {inverted ? (
                      <PricingTierBadge className="rounded-none bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
                        {t.badge ?? 'Popular'}
                      </PricingTierBadge>
                    ) : null}
                    <PricingTierHeader className="gap-3">
                      <PricingTierName
                        className={cn(
                          'font-mono text-[13px] font-semibold uppercase tracking-[0.2em]',
                          inverted ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.name}
                      </PricingTierName>
                      {t.tagline && (
                        <PricingTierTagline
                          className={cn(inverted && 'text-background/60')}
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
                          'text-5xl font-extrabold leading-none tracking-tighter tabular-nums sm:text-6xl',
                          inverted ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            inverted && 'text-background/60',
                          )}
                        >
                          {t.period}
                        </PricingTierPeriod>
                      )}
                      {t.unit && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            inverted && 'text-background/60',
                          )}
                        >
                          {t.unit}
                        </PricingTierPeriod>
                      )}
                      {t.cadence && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            inverted && 'text-background/60',
                          )}
                        >
                          {t.cadence}
                        </PricingTierPeriod>
                      )}
                      {t.suffix && (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.14em]',
                            inverted && 'text-background/60',
                          )}
                        >
                          {t.suffix}
                        </PricingTierPeriod>
                      )}
                    </PricingTierHeader>
                    {t.features && (
                      <PricingTierFeatures
                        className={cn(
                          'gap-0 divide-y border-t pt-0',
                          inverted
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
                              'py-3 text-sm',
                              inverted
                                ? 'text-background/70 [&>svg]:text-primary'
                                : 'text-muted-foreground',
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
                      <PricingTierCta
                        target={t.ctaTarget}
                        className={cn(
                          'rounded-none font-mono text-[12px] font-semibold uppercase tracking-[0.16em] transition-[transform,box-shadow,background-color] duration-100 active:translate-y-px',
                          inverted
                            ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-primary/50 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0] active:shadow-primary/50'
                            : 'border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
                        )}
                      >
                        {t.cta}
                      </PricingTierCta>
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
