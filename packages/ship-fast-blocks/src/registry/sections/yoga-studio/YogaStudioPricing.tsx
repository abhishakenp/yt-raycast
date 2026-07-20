import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
} from '#/section-kit/PricingGrid.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * YogaStudioPricing — hairline membership ledger for a yoga-studio page backed by
 * shared local-service Lakebed booking state. An asymmetric header (mono index
 * eyebrow + calm clean-sans heading + grounding intro, mono plan-count meta on
 * the right) sits above a collapsed-border 3-up comparison ledger of square
 * membership cells divided by hairlines; the featured plan rests on a soft muted
 * wash with a primary top rule and a square mono badge. Each plan shows a name, a
 * giant extrabold tabular price with a mono billing period, a hairline-divided
 * perk checklist, and a square booking CTA (filled primary on the featured plan,
 * a quiet outline that inverts on hover elsewhere) with press feedback. Every CTA
 * records booking intent to the shared local-service Lakebed. Use to present
 * drop-in, monthly, and annual membership options. Renders fully with no props
 * via baked-in defaults.
 */
export const YogaStudioPricing = defineCapsule({
  name: 'YogaStudioPricing',
  description:
    'Hairline membership ledger for a yoga-studio page backed by shared local-service Lakebed booking state: an asymmetric header (mono index eyebrow + calm clean-sans heading + grounding intro, mono plan-count meta right) above a collapsed-border 3-up comparison ledger of square membership cells; the featured plan rests on a soft muted wash with a primary top rule and a square mono badge. Each plan shows a name, a giant extrabold tabular price with a mono billing period, a hairline-divided perk checklist, and a square booking CTA (filled primary on the featured plan, quiet outline elsewhere) with press feedback that records booking intent. Use to present drop-in, monthly, and annual membership options.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Membership tiers; mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Memberships that fit your practice'
    const subheading =
      props.subheading ??
      'Come once or come every day. Pick the plan that matches your rhythm — no long contracts.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Drop-In',
            price: '$22',
            period: '/class',
            features: [
              'Single class access',
              'Any style on the schedule',
              'Mat & prop use included',
              'No commitment',
            ],
            cta: 'Book a Class',
            highlighted: false,
          },
          {
            name: 'Monthly Unlimited',
            price: '$139',
            period: '/mo',
            features: [
              'Unlimited classes',
              'All styles & levels',
              'Free mat & prop use',
              '10% off workshops',
              'Pause anytime',
            ],
            cta: 'Start Free Trial',
            highlighted: true,
          },
          {
            name: 'Annual Unlimited',
            price: '$1,390',
            period: '/yr',
            features: [
              'Unlimited classes all year',
              'Two months free vs monthly',
              '20% off workshops & retreats',
              'Bring-a-friend passes',
              'Priority event registration',
            ],
            cta: 'Go Annual',
            highlighted: false,
          },
        ]

    useSyncLocalServices(
      lakebed,
      tiers.map((tier) =>
        localServiceItem({
          name: tier.name,
          price: `${tier.price}${tier.period ?? ''}`,
          summary: tier.features.at(0) ?? '',
        }),
      ),
    )

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">01 / Memberships</MonoTag>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
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
                period?: string
                unit?: string
                highlighted?: boolean
                featured?: boolean
                popular?: boolean
                badge?: string
              }
              const isFeatured = Boolean(
                t.highlighted || t.featured || t.popular,
              )
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
                    <PricingTierName className="text-lg font-semibold tracking-tight">
                      {t.name}
                    </PricingTierName>
                    <span className="mt-2 flex items-baseline gap-1.5">
                      <PricingTierPrice className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
                        {t.price}
                      </PricingTierPrice>
                      {t.period && (
                        <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.15em]">
                          {t.period}
                        </PricingTierPeriod>
                      )}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
                    <PricingTierFeatures className="gap-0 divide-y divide-border border-y border-border">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={feature}
                          className="items-center gap-3 py-2.5"
                        >
                          {feature}
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
        </Container>
      </section>
    )
  },
})
