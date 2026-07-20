import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServicePricing — playful-Swiss collapsed-border pricing ledger for a
 * home-cleaning / maid-service landing page. An asymmetric header row (left
 * mono "04 / Pricing" eyebrow + heading + lead, right tabular mono plan count)
 * above a single hard-shadow framed ledger of 1/3-column plan cells sharing
 * 2px rules: each cell carries a mono index label, a bold plan name, a blurb,
 * a giant extrabold tabular price with mono period, a hairline feature list,
 * and a square invert-on-hover CTA with press feedback. The featured plan is a
 * full ink-inverted cell (foreground background, background text) wearing a
 * rotated primary badge chip. An optional footnote strip with a routable CTA
 * link renders below when provided. Use for service-pricing / plan-selection
 * blocks for residential cleaning companies, maid services, or any local
 * home-service business. Renders fully with no props via three baked-in
 * default plans.
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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const CleaningServicePricing = defineCapsule({
  name: 'CleaningServicePricing',
  description:
    "Playful-Swiss collapsed-border pricing ledger for a home-cleaning / maid-service landing page: asymmetric header row (left mono '04 / Pricing' eyebrow + heading + lead, right tabular mono plan count) above a hard-shadow framed ledger of 1/3-column plan cells sharing 2px rules — each with a mono index label, bold plan name, blurb, giant extrabold tabular price with mono period, hairline feature list, and a square invert-on-hover CTA with press feedback. The featured plan is a full ink-inverted cell with a rotated primary badge chip. Optional footnote strip with routable CTA link below. Use for service-pricing / plan-selection blocks for residential cleaning, maid services, or local home-service businesses.",
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
          blurb: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote question below the pricing grid. */
    footnote: z.string().optional(),
    /** Footnote CTA / phone line shown as a routable link. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Transparent pricing, no surprises'
    const description =
      props.description ??
      'Choose the plan that fits your home and budget. All plans include our satisfaction guarantee.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Studio / 1 Bedroom',
            blurb: 'Perfect for apartments and small spaces',
            price: '$129',
            period: '/visit',
            features: [
              '2-3 hours of cleaning',
              'Up to 800 sq ft',
              '1 bathroom',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
          },
          {
            name: '2-3 Bedroom Home',
            blurb: 'Ideal for families and medium homes',
            price: '$189',
            period: '/visit',
            features: [
              '3-4 hours of cleaning',
              'Up to 2,000 sq ft',
              'Up to 2 bathrooms',
              'Inside refrigerator',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: '4+ Bedroom Home',
            blurb: 'For larger homes and estates',
            price: '$279',
            period: '/visit',
            features: [
              '4-6 hours of cleaning',
              'Up to 4,000 sq ft',
              'Up to 4 bathrooms',
              '2-person cleaning team',
            ],
            cta: 'Book This Plan',
          },
        ]
    useSyncLocalServices(
      lakebed,
      plans.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.period}`,
          summary: plan.blurb,
        }),
      ),
    )
    return (
      <section className={cn('bg-muted/30 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="04 / Pricing"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              <span className="tabular-nums">
                {String(plans.length).padStart(2, '0')}
              </span>{' '}
              plans · guarantee included
            </p>
          </div>
          <PricingGrid
            className={cn(
              'gap-0 border-2 border-foreground bg-card shadow-[8px_8px_0_0] shadow-foreground md:grid-cols-3 xl:grid-cols-3',
              props.className,
            )}
          >
            {plans.map((tier, i) => {
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
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-6 rounded-none border-0 border-b-2 border-foreground p-6 shadow-none ring-0 last:border-b-0 sm:p-8 md:border-b-0 md:border-r-2 md:last:border-r-0',
                    featured ? 'bg-foreground text-background' : 'bg-card',
                  )}
                >
                  {featured ? (
                    <PricingTierBadge className="w-fit -rotate-2 rounded-none border-2 border-background bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                  <PricingTierHeader>
                    <PricingTierName
                      className={cn(
                        'text-lg font-bold tracking-tight',
                        featured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline
                        className={featured ? 'text-background/70' : undefined}
                      >
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline
                        className={featured ? 'text-background/70' : undefined}
                      >
                        {t.blurb}
                      </PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline
                        className={featured ? 'text-background/70' : undefined}
                      >
                        {t.description}
                      </PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline
                        className={featured ? 'text-background/70' : undefined}
                      >
                        {t.audience}
                      </PricingTierTagline>
                    )}
                    <PricingTierPrice
                      className={cn(
                        'mt-2 text-5xl font-extrabold tabular-nums tracking-tight',
                        featured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod
                        className={cn(
                          'font-mono text-[11px] uppercase tracking-[0.14em]',
                          featured
                            ? 'text-background/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {t.period}
                      </PricingTierPeriod>
                    )}
                    {t.unit && <PricingTierPeriod>{t.unit}</PricingTierPeriod>}
                    {t.cadence && (
                      <PricingTierPeriod>{t.cadence}</PricingTierPeriod>
                    )}
                    {t.suffix && (
                      <PricingTierPeriod>{t.suffix}</PricingTierPeriod>
                    )}
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures
                      className={cn(
                        'gap-0 border-t pt-1',
                        featured ? 'border-background/20' : 'border-border',
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
                            'border-b py-2.5 text-sm last:border-b-0',
                            featured
                              ? 'border-background/20 text-background/70'
                              : 'border-border text-muted-foreground',
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
                        'rounded-none border-2 py-3 text-sm font-bold transition-all duration-150 active:translate-y-px',
                        featured
                          ? 'border-background bg-background text-foreground hover:bg-background/90'
                          : 'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {t.cta}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
          {(props.footnote || props.footnoteCta) && (
            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0] shadow-foreground sm:flex-row sm:items-center sm:p-6">
              {props.footnote && (
                <p className="text-sm text-muted-foreground">
                  {props.footnote}
                </p>
              )}
              {props.footnoteCta && (
                <NavbarRouteLink
                  href={props.footnoteCta}
                  className="inline-flex items-center whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary active:translate-y-px"
                >
                  {props.footnoteCta}
                </NavbarRouteLink>
              )}
            </div>
          )}
        </Container>
      </section>
    )
  },
})
