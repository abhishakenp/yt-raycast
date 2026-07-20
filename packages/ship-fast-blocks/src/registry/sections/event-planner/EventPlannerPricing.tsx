import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import {
  InquiryActionButton,
  InquiryMutationSpinner,
} from '../contact/inquiry-interactions.tsx'
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
import { Container } from '#/section-kit/Container.tsx'
/**
 * EventPlannerPricing — kinetic-poster three-tier planning-packages block on a
 * muted band. An asymmetric intro (a mono metadata rail with a primary square,
 * hairline rule and tier count above a giant tight-tracked heading and lede)
 * above a 3-up grid of hard-framed rounded-none package cards; the "popular" tier
 * carries a primary border, a hard primary offset shadow and a squared ribbon,
 * while the others are hairline cards. Each card shows name, tagline, a giant
 * extrabold tabular price, a check-marked feature list, and a full-width squared
 * ticket-stub CTA with press feedback that records a real Lakebed pricing action.
 * Use to present tiered pricing for event/wedding planners or premium service
 * businesses.
 */
export const EventPlannerPricing = defineCapsule({
  name: 'EventPlannerPricing',
  description:
    "Kinetic-poster three-tier planning-packages block on a muted band: an asymmetric intro (a mono metadata rail with a primary square, hairline rule and tier count above a giant tight-tracked heading and lede) above a 3-up grid of hard-framed rounded-none package cards; the 'popular' tier carries a primary border, a hard primary offset shadow and a squared ribbon, while the others are hairline cards. Each card shows name, tagline, a giant extrabold tabular price, a check-marked feature list, and a full-width squared ticket-stub CTA with press feedback that records a real Lakebed pricing action. Use to present tiered pricing (e.g. Essential, Signature, White Glove) for event/wedding planners or premium service businesses.",
  lakebed: inquiryLakebed,
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    popularLabel: z.string().optional(),
    cta: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          features: z.array(z.string()),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const pricingEyebrow = props.eyebrow ?? 'Investment'
    const pricingHeading = props.heading ?? 'Planning Packages'
    const pricingDesc =
      props.description ??
      'Transparent pricing for weddings and celebrations. Custom quotes available for corporate and destination events.'
    const pricingCta = props.cta ?? 'Inquire'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            tagline: 'Day-of coordination',
            price: '$2,500',
            features: [
              'One month of pre-event support',
              'Day-of timeline creation',
              'Vendor coordination',
              'On-site management (10 hours)',
              'Setup and breakdown oversight',
            ],
          },
          {
            name: 'Signature',
            tagline: 'Partial planning',
            price: '$5,500',
            popular: true,
            features: [
              'Everything in Essential, plus:',
              'Six months of planning support',
              'Vendor recommendations & referrals',
              'Design concept & mood board',
              'Two venue walkthroughs',
              'Rehearsal coordination',
            ],
          },
          {
            name: 'White Glove',
            tagline: 'Full-service planning',
            price: '$12,000',
            features: [
              'Everything in Signature, plus:',
              'Full planning from day one',
              'Unlimited vendor meetings',
              'Custom design & décor sourcing',
              'Guest management & RSVP tracking',
              'Dedicated lead planner + assistant',
            ],
          },
        ]
    return (
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-14 max-w-3xl lg:mb-20">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {pricingEyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
              >
                {String(pricingTiers.length).padStart(2, '0')} / packages
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
              {pricingHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {pricingDesc}
            </p>
          </div>
          <PricingGrid>
            {pricingTiers.map((tier) => {
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
              const isPopular = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              return (
                <PricingTier
                  key={t.name}
                  variant={isPopular ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-none border-2 shadow-none ring-0',
                    isPopular
                      ? 'border-primary bg-primary/[0.04] shadow-[7px_7px_0_0] shadow-primary/40'
                      : 'border-foreground/15 bg-background',
                  )}
                >
                  {isPopular ? (
                    <PricingTierBadge className="rounded-none border-2 border-foreground font-mono text-[10px] uppercase tracking-[0.14em]">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline>{t.tagline}</PricingTierTagline>
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
                    <PricingTierPrice className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod>{t.period}</PricingTierPeriod>
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
                    <PricingTierFeatures className="border-t border-border pt-6">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                        >
                          {typeof feature === 'string'
                            ? feature
                            : (feature as { label: string }).label}
                        </PricingTierFeature>
                      ))}
                    </PricingTierFeatures>
                  )}
                  <InquiryActionButton
                    lakebed={lakebed}
                    label={`${pricingCta} ${t.name}`}
                    source="Event planner pricing"
                    target={t.name}
                    kind="pricing"
                    pendingChildren={
                      <>
                        <InquiryMutationSpinner />
                        Recording
                      </>
                    }
                    className={cn(
                      'mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none border-2 border-foreground px-5 py-3 text-sm font-semibold shadow-[3px_3px_0_0] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0] active:translate-y-0 active:shadow-[1px_1px_0_0] disabled:pointer-events-none disabled:opacity-70',
                      isPopular
                        ? 'bg-primary text-primary-foreground shadow-foreground'
                        : 'bg-foreground text-background shadow-primary/40',
                    )}
                  >
                    {pricingCta}
                  </InquiryActionButton>
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
