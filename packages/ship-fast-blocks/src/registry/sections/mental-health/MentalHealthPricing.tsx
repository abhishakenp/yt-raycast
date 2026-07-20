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
import { Container } from '#/section-kit/Container.tsx'

/**
 * MentalHealthPricing — a warm-editorial collapsed-border pricing ledger for a
 * therapy practice. An asymmetric header (left-aligned mono eyebrow + serif
 * heading + lede, mono index meta right) above a hairline-framed 3-up
 * comparison ledger of square plan cells divided by hairlines; the "most
 * popular" tier sits on a soft muted wash with a primary top rule and a square
 * mono badge. Each plan shows a serif name, a mono cadence, a giant extrabold
 * tabular price + mono unit, a hairline-divided check list, and a square
 * booking button (filled primary on the featured plan, quiet outline that
 * inverts on hover elsewhere) with press feedback, plus a mono reassurance
 * note under the ledger. Buttons request a booking through the shared
 * lakebed. Use to present session rates for therapists, counselors,
 * psychologists or psychiatry.
 */
export const MentalHealthPricing = defineCapsule({
  name: 'MentalHealthPricing',
  description:
    "Warm-editorial collapsed-border pricing ledger for a therapy practice: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono index meta right) above a hairline-framed 3-up comparison ledger of square plan cells; the 'most popular' tier sits on a soft muted wash with a primary top rule and a square mono badge. Each plan shows a serif name, a mono cadence, a giant extrabold tabular price + mono unit, a hairline-divided check list, and a square booking button (filled primary on the featured plan, quiet outline elsewhere), with a mono reassurance note under the ledger. Buttons request a booking through the shared lakebed. Use to present session rates for therapists, counselors, psychologists or psychiatry.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          cadence: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
        }),
      )
      .optional(),
    note: z.string().optional(),
    /** Navigation target for the tier booking buttons (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Investment in You'
    const heading = props.heading ?? 'Transparent pricing'
    const description =
      props.description ??
      'We believe mental health care should be accessible. We accept most major insurance plans and offer sliding scale options.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Individual Therapy',
            cadence: '50-minute session',
            price: '$175',
            unit: '/session',
            features: [
              'Licensed therapist',
              'In-person or virtual',
              'Insurance billing included',
              'Between-session messaging',
            ],
            cta: 'Book Individual',
            popular: false,
          },
          {
            name: 'Couples Therapy',
            cadence: '80-minute session',
            price: '$250',
            unit: '/session',
            features: [
              'Gottman-trained therapist',
              'Extended 80-minute format',
              'Relationship assessment tools',
              'Homework & resources included',
            ],
            cta: 'Book Couples',
            popular: true,
          },
          {
            name: 'Psychiatry',
            cadence: 'Medication management',
            price: '$350',
            unit: '/initial',
            features: [
              'Board-certified psychiatrist',
              '60-minute initial evaluation',
              'Follow-ups: $175 (30 min)',
              'Prescription management',
            ],
            cta: 'Book Psychiatry',
            popular: false,
          },
        ]
    const note =
      props.note ??
      'Sliding-scale spots and out-of-network superbills available. Insurance verified before your first session.'
    useSyncLocalServices(
      lakebed,
      tiers.map((tier) =>
        localServiceItem({
          name: tier.name,
          price: `${tier.price}${tier.unit}`,
          summary: tier.cadence,
        }),
      ),
    )
    return (
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container size="lg">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(tiers.length).padStart(2, '0')} / plans
            </MonoTag>
          </div>

          <PricingGrid className="mx-auto max-w-6xl gap-0 divide-y divide-border border border-border md:grid-cols-3 md:divide-x md:divide-y-0 xl:grid-cols-3">
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
                    <PricingTierName className="font-serif text-lg font-medium tracking-tight">
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
                    <PricingTierPrice className="mt-2 text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
                      {t.price}
                    </PricingTierPrice>
                    {t.period && (
                      <PricingTierPeriod>{t.period}</PricingTierPeriod>
                    )}
                    {t.unit && (
                      <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.15em]">
                        {t.unit}
                      </PricingTierPeriod>
                    )}
                    {t.cadence && (
                      <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.15em]">
                        {t.cadence}
                      </PricingTierPeriod>
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
            {note}
          </p>
        </Container>
      </section>
    )
  },
})
