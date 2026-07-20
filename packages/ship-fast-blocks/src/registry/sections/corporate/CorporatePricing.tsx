import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporatePricing — Swiss-comparison 3-tier pricing ledger for an enterprise /
 * corporate B2B site. A muted wash band with a double-rule asymmetric header
 * (mono "06 / Pricing" index, left-aligned heading, lede in the offset right
 * column, tabular plan count) above a collapsed-border row of square-edged
 * pricing cells sharing hairline rules; the featured cell fully ink-inverts
 * (foreground background, background text) with a square mono badge. Every
 * cell lists plan name, blurb, a giant tabular price, a hairline-ruled feature
 * checklist, and a square-edged CTA with press feedback that routes through
 * section-kit route links. Use for SaaS, managed services, or enterprise
 * software pricing pages.
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
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const CorporatePricing = defineCapsule({
  name: 'CorporatePricing',
  description:
    'Swiss-comparison 3-tier pricing ledger for an enterprise / corporate B2B site: a muted wash band with a double-rule asymmetric header (mono index, left-aligned heading, offset lede, tabular plan count) above a collapsed-border row of square-edged pricing cells sharing hairline rules, with the featured cell fully ink-inverted and marked by a square mono badge. Each cell lists plan name, blurb, a giant tabular price, a hairline-ruled feature checklist, and a square-edged CTA with press feedback routing through section-kit route links. Use for SaaS, managed services, or enterprise software pricing.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string().optional(),
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
    const heading = props.heading ?? 'Transparent enterprise pricing'
    const description =
      props.description ??
      'Flexible plans designed to scale with your organization. All plans include implementation support.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Professional',
            blurb: 'For growing teams up to 250 employees',
            price: '$2,500',
            period: '/month',
            features: [
              'Up to 5 cloud environments',
              '24/7 email and chat support',
              'Standard security features',
              'Basic analytics dashboard',
              'Quarterly business reviews',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Enterprise',
            blurb: 'For mid-size organizations up to 5,000 employees',
            price: '$8,500',
            period: '/month',
            features: [
              'Unlimited cloud environments',
              '24/7 phone, email & chat support',
              'Advanced security & compliance',
              'Custom analytics & AI insights',
              'Monthly business reviews',
              'Dedicated success manager',
            ],
            cta: 'Contact Sales',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Global',
            blurb: 'For large enterprises with 5,000+ employees',
            price: 'Custom',
            period: '',
            features: [
              'Everything in Enterprise',
              'Multi-region deployment',
              'Custom SLAs & contracts',
              'On-premise deployment options',
              'Executive advisory board access',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]
    return (
      <section className={cn('bg-muted/40 py-16 lg:py-28', props.className)}>
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              06 / Pricing
            </span>
            <span className="tabular-nums">
              {String(plans.length).padStart(2, '0')} plans
            </span>
          </div>
          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-3xl gap-3 sm:mb-14 lg:mb-16"
            titleClassName="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="max-w-xl text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'grid gap-0 border border-border md:grid-cols-3',
              props.className,
            )}
          >
            {plans.map((tier) => {
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
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-none border-0 shadow-none ring-0 md:border-r md:border-border md:last:border-r-0',
                    'max-md:border-b max-md:border-border max-md:last:border-b-0',
                    isFeatured
                      ? 'bg-foreground text-background'
                      : 'bg-background',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="rounded-none bg-background font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName
                      className={cn(
                        'tracking-tight',
                        isFeatured && 'text-background',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <PricingTierPrice
                      className={cn(
                        'mt-2 text-[clamp(2.5rem,4vw,3.25rem)] font-semibold leading-none tracking-tight tabular-nums',
                        isFeatured && 'text-background',
                      )}
                    >
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.16em]',
                          isFeatured && 'text-background/60',
                        )}
                      >
                        {t.period}
                      </PricingTierPeriod>
                    )}
                    {t.unit && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.unit}
                      </PricingTierPeriod>
                    )}
                    {t.cadence && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.cadence}
                      </PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod
                        className={cn(isFeatured && 'text-background/60')}
                      >
                        {t.suffix}
                      </PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-0 divide-y border-t pt-0',
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
                            'py-2.5',
                            isFeatured &&
                              'text-background/70 [&>svg]:text-background',
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
                        'rounded-none transition-all duration-150 active:translate-y-px',
                        isFeatured
                          ? 'bg-background text-foreground hover:bg-background/90'
                          : 'border border-border bg-background text-foreground hover:bg-muted',
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
