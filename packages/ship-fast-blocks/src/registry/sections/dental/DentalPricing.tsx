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
 * DentalPricing — collapsed-border pricing ledger for a dental practice site.
 * An asymmetric header (left-aligned mono eyebrow + heading + lede, mono index
 * meta right) above a hairline-framed 3-up comparison ledger of square plan
 * cells divided by hairlines; the featured plan sits on a soft muted wash with
 * a primary top rule and a square mono badge. Each plan shows a name, mono
 * tagline, giant extrabold tabular price + mono period, a hairline-divided
 * check list, and a square CTA (filled primary on the featured plan, quiet
 * outline that inverts on hover elsewhere) with press feedback, plus a mono
 * reassurance note under the ledger. CTAs route through section-kit route
 * links. Use to present exam fees, membership tiers, or treatment packages for
 * dentists, dental offices, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
export const DentalPricing = defineCapsule({
  name: 'DentalPricing',
  description:
    'Collapsed-border pricing ledger for a dental practice site: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono index meta right) above a hairline-framed 3-up comparison ledger of square plan cells; the featured plan sits on a soft muted wash with a primary top rule and a square mono badge. Each plan shows a name, mono tagline, giant extrabold tabular price + mono period, a hairline-divided check list, and a square CTA (filled primary on the featured plan, quiet outline elsewhere), with a mono reassurance note under the ledger. CTAs route through section-kit route links. Use to present exam fees, membership tiers, or treatment packages for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    note: z.string().optional(),
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
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const pricingEyebrow = props.eyebrow ?? 'Pricing & Membership'
    const pricingHeading =
      props.heading ?? 'Transparent pricing for every budget'
    const pricingDesc =
      props.description ??
      'We accept most insurance plans and offer an in-house membership plan for uninsured patients. No hidden fees, ever.'
    const pricingNote =
      props.note ??
      'All major credit cards, HSA/FSA, and CareCredit financing accepted. Insurance claims filed on your behalf.'
    const pricingPlans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'New Patient Exam',
            tagline: 'Comprehensive first visit',
            price: '$99',
            period: ' one-time',
            features: [
              'Complete oral examination',
              'Digital X-rays (4 bitewings)',
              'Oral cancer screening',
              'Personalized treatment plan',
            ],
            cta: 'Book Now',
          },
          {
            name: 'Annual Membership',
            tagline: 'For uninsured patients',
            price: '$39',
            period: '/month',
            features: [
              '2 professional cleanings/year',
              'Annual exam & X-rays',
              '15% off all procedures',
              'Emergency visit included',
              'No waiting periods',
            ],
            cta: 'Enroll Today',
            featured: true,
            badge: 'Popular',
          },
          {
            name: 'Professional Whitening',
            tagline: 'In-office treatment',
            price: '$499',
            period: ' one-time',
            features: [
              'Up to 8 shades lighter',
              '90-minute single session',
              'Take-home touch-up kit',
              'Results last 1-3 years',
            ],
            cta: 'Book Consultation',
          },
        ]
    useSyncLocalServices(
      lakebed,
      pricingPlans.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.period}`,
          summary: plan.tagline,
        }),
      ),
    )
    return (
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={pricingEyebrow}
              title={pricingHeading}
              subtitle={pricingDesc}
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
              {String(pricingPlans.length).padStart(2, '0')} / plans
            </MonoTag>
          </div>
          <PricingGrid className="mx-auto max-w-6xl gap-0 divide-y divide-border border border-border md:grid-cols-3 md:divide-x md:divide-y-0 xl:grid-cols-3">
            {pricingPlans.map((tier) => {
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
              const isFeatured = t.highlighted || t.featured || t.popular
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
                  <PricingTierHeader>
                    <PricingTierName className="text-lg font-bold tracking-tight">
                      {t.name}
                    </PricingTierName>
                    {t.tagline && (
                      <PricingTierTagline className="font-mono text-[11px] uppercase tracking-[0.15em]">
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
                    <PricingTierPrice className="mt-2 text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.15em]">
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
                      intentLabel={t.cta}
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
                        'mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-none px-5 py-2.5 text-sm font-semibold transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
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
          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            {pricingNote}
          </p>
        </Container>
      </section>
    )
  },
})
