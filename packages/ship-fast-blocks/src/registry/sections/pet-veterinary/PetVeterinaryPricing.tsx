import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

const DEFAULT_TIERS: {
  name: string
  price: string
  period?: string
  features?: string[]
  cta?: string
  ctaTarget?: string
  highlighted?: boolean
}[] = [
  {
    name: 'Basic Wellness',
    price: '$29',
    period: '/month',
    features: [
      'Annual wellness exam',
      'Core vaccinations',
      'Heartworm test',
      '10% off additional services',
    ],
    cta: 'Choose Basic',
    ctaTarget: 'Contact',
  },
  {
    name: 'Plus Care',
    price: '$49',
    period: '/month',
    features: [
      'Everything in Basic',
      'Two wellness exams a year',
      'Dental check & cleaning',
      'Flea, tick & heartworm prevention',
      '15% off additional services',
    ],
    cta: 'Choose Plus',
    ctaTarget: 'Contact',
    highlighted: true,
  },
  {
    name: 'Complete Care',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Plus',
      'Unlimited wellness visits',
      'Routine bloodwork & labs',
      'Priority emergency access',
      '20% off additional services',
    ],
    cta: 'Choose Complete',
    ctaTarget: 'Contact',
  },
]

export const PetVeterinaryPricing = defineCapsule({
  name: 'PetVeterinaryPricing',
  description:
    'Warm friendly-clinical wellness-plan pricing ledger for a veterinary clinic site, composing the PricingGrid kit composite into a collapsed-border hairline 3-up comparison of membership tiers under an asymmetric header (left heading + lede, mono plan-count meta right). Renders a Basic Wellness plan, a highlighted Plus Care plan on a soft muted wash with a primary top rule, a square mono badge, and a rotated rounded-full "most loved" sticker, and a Complete Care plan — each with a giant extrabold tabular price + mono period, a hairline-divided feature list, and a square booking CTA (filled primary on the featured plan, quiet outline that inverts on hover elsewhere) with press feedback that writes the plan to shared booking state. Accepts a public `tiers` prop to override the plans. Use it to give pet parents clear, no-surprises options for keeping their companions healthy year-round.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Wellness plans made simple'
    const subheading =
      props.subheading ??
      'Affordable monthly care that spreads the cost of keeping your pet healthy — no hidden fees, ever.'
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    useSyncLocalServices(
      lakebed,
      tiers.map((tier) =>
        localServiceItem({
          name: tier.name,
          price: `${tier.price}${tier.period ?? ''}`,
        }),
      ),
    )

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="mt-4 text-base text-muted-foreground sm:text-lg"
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
                    'relative gap-6 rounded-none border-0 p-6 shadow-none ring-0 sm:p-8',
                    isFeatured
                      ? 'border-t-2 border-primary bg-muted/40'
                      : 'bg-background',
                  )}
                >
                  {isFeatured ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-3 -rotate-6 rounded-full border-2 border-foreground bg-background px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[2px_2px_0_0] shadow-primary/40"
                    >
                      most loved
                    </span>
                  ) : null}
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
        </Container>
      </section>
    )
  },
})
