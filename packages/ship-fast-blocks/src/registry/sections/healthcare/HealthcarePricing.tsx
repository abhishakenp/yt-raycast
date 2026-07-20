import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcarePricing — collapsed-border pricing ledger for a medical-clinic
 * page. An asymmetric header (left-aligned mono eyebrow + heading + lede, mono
 * "[ plans ]" meta right) above a hairline-framed 3-up comparison ledger of
 * square plan cells divided by hairlines; the featured plan sits on a soft
 * muted wash with a primary top rule and a square mono badge. Each plan shows a
 * name, mono tagline, giant extrabold tabular price + mono unit, a
 * hairline-divided check list, and a square CTA (filled primary on the featured
 * plan, quiet outline that inverts on hover elsewhere) with press feedback that
 * writes the plan to shared booking state; an optional mono reassurance note
 * (with an inline verify-coverage link) sits under the ledger. Use for a
 * self-pay / visit-pricing / membership section of a doctors' office or clinic.
 * Renders fully with no props via baked-in visit-tier defaults.
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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const HealthcarePricing = defineCapsule({
  name: 'HealthcarePricing',
  description:
    "Collapsed-border pricing ledger for a medical-clinic page: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono plans meta right) above a hairline-framed 3-up comparison ledger of square plan cells; the featured plan sits on a soft muted wash with a primary top rule and a square mono badge. Each plan shows a name, mono tagline, giant extrabold tabular price + mono unit, a hairline-divided check list, and a square CTA (filled primary on the featured plan, quiet outline elsewhere) with press feedback that writes the plan to shared booking state, plus an optional mono reassurance note with an inline verify-coverage link under the ledger. Use for a self-pay / visit-pricing / membership section of a doctors' office or clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans: name, tagline, price, unit, features, CTA, featured flag, badge. */
    items: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Reassurance note under the grid. */
    note: z.string().optional(),
    /** Inline link label appended after the note. */
    noteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Transparent Pricing'
    const heading = props.heading ?? 'Simple, upfront pricing'
    const description =
      props.description ??
      'No hidden fees or surprise bills. We accept most major insurance plans and offer transparent self-pay rates.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'New Patient Visit',
            tagline: 'Comprehensive initial consultation',
            price: '$180',
            unit: '/visit',
            features: [
              '60-minute consultation',
              'Complete health history review',
              'Personalized care plan',
              'Patient portal access',
            ],
            cta: 'Book new patient visit',
          },
          {
            name: 'Follow-up Visit',
            tagline: 'For existing patients',
            price: '$120',
            unit: '/visit',
            features: [
              '30-minute consultation',
              'Progress review & adjustments',
              'Medication management',
              'In-person or virtual',
            ],
            cta: 'Book follow-up',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Urgent Care',
            tagline: 'Same-day appointments',
            price: '$150',
            unit: '/visit',
            features: [
              'Same-day appointment',
              'Acute illness treatment',
              'Rapid testing available',
              'Prescription refills',
            ],
            cta: 'Book urgent care',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.unit}`,
          summary: plan.tagline,
        }),
      ),
    )
    return (
      <section
        id="pricing"
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="pricing-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              titleId="pricing-heading"
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / plans
            </MonoTag>
          </div>

          <PricingGrid className="mx-auto max-w-6xl gap-0 divide-y divide-border border border-border md:grid-cols-3 md:divide-x md:divide-y-0 xl:grid-cols-3">
            {items.map((tier) => {
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
              const unit = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  variant={isFeatured ? 'highlighted' : undefined}
                  className={cn(
                    'gap-6 rounded-none border-0 p-6 shadow-none ring-0 sm:p-8',
                    isFeatured
                      ? 'border-t-2 border-primary bg-muted/40'
                      : 'bg-background',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="rounded-none px-2.5 py-1 font-mono text-[10px] font-normal uppercase tracking-[0.15em]">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <PricingTierName className="text-lg font-bold tracking-tight">
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em]">
                        {t.tagline}
                      </PricingTierTagline>
                    )}
                    {t.blurb && (
                      <PricingTierTagline>{t.blurb}</PricingTierTagline>
                    )}
                    {t.description && (
                      <PricingTierTagline>{t.description}</PricingTierTagline>
                    )}
                    {t.audience && (
                      <PricingTierTagline>{t.audience}</PricingTierTagline>
                    )}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
                        {t.price}
                      </PricingTierPrice>
                      {unit ? (
                        <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.15em]">
                          {unit}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures className="gap-0 divide-y divide-border border-y border-border">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className="items-center gap-3 py-2.5"
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  {t.cta && (
                    <LocalServiceBookingButton
                      lakebed={lakebed}
                      intentLabel={t.ctaTarget ?? t.cta}
                      service={t.name}
                      source="pricing"
                      aria-label={`${t.cta} for ${t.name}`}
                      pendingChildren={
                        <>
                          <LocalServiceMutationSpinner className="size-4" />
                          Booking
                        </>
                      }
                      className={cn(
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-foreground/25 bg-transparent text-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {t.cta}
                    </LocalServiceBookingButton>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>

          {props.note ? (
            <p className="mx-auto mt-8 max-w-6xl text-center font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              {props.note}
              {props.noteCta ? (
                <>
                  {' '}
                  <NavbarRouteLink
                    href={props.noteCta}
                    className="text-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-primary"
                  >
                    {props.noteCta}
                  </NavbarRouteLink>
                </>
              ) : null}
            </p>
          ) : null}
        </Container>
      </section>
    )
  },
})
