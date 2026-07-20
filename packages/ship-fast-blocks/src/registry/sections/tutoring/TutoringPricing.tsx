import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

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
    name: 'Single Session',
    price: '$45',
    period: '/session',
    features: [
      'One 60-minute 1-on-1 session',
      'Matched to your subject & goals',
      'Session summary for parents',
      'No commitment — try us out',
    ],
    cta: 'Book now',
    ctaTarget: 'Contact',
  },
  {
    name: '10-Session Pack',
    price: '$399',
    period: '/pack',
    features: [
      'Ten 60-minute sessions',
      'Save $51 vs. single sessions',
      'Same trusted tutor each week',
      'Progress tracking & check-ins',
      'Flexible rescheduling',
    ],
    cta: 'Get started',
    ctaTarget: 'Contact',
    highlighted: true,
  },
  {
    name: 'Monthly Unlimited',
    price: '$299',
    period: '/month',
    features: [
      'Unlimited weekly sessions',
      'Priority tutor matching',
      'Test-prep & homework support',
      'Monthly progress report',
    ],
    cta: 'Get started',
    ctaTarget: 'Contact',
  },
]

export const TutoringPricing = defineCapsule({
  name: 'TutoringPricing',
  description:
    "Transparent tuition band for tutoring sites rendered as an editorial-academic collapsed-border pricing ledger backed by shared Lakebed conversion state. An asymmetric header (mono tuition eyebrow + left-aligned serif heading and lede, with a mono plans meta on the right) sits above a sharp-cornered, hairline-shared 3-tier ledger: each cell carries a mono plan index, a serif plan name, a giant tabular-nums price, a hairline-divided feature checklist, and a full-width square mutation CTA with a hard offset shadow and press feedback. The highlighted 10-Session Pack inverts to bg-foreground/text-background with a mono 'Popular' chip. Plans seed command search and every CTA records the selected plan to Lakebed. Accepts a public `tiers` prop to override the plans. Use it to give parents clear, no-surprises options and reduce sticker shock.",
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Simple, friendly pricing'
    const subheading =
      props.subheading ??
      'Pay as you go or save with a package — whatever fits your family. No hidden fees, ever.'
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.period ?? '',
          price: tier.price,
          summary: tier.features?.at(0) ?? '',
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
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block" tone="primary">
                Tuition
              </MonoTag>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {subheading}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ plans ] {String(tiers.length).padStart(2, '0')}
            </span>
          </div>

          <PricingGrid className="gap-0 border-l border-t border-border sm:gap-0 md:grid-cols-3 xl:grid-cols-3">
            {tiers.map((tier, index) => {
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
              const period = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8',
                    isFeatured
                      ? 'bg-foreground text-background md:-my-3 md:border md:border-foreground md:py-11'
                      : 'bg-card',
                  )}
                >
                  {isFeatured ? (
                    <PricingTierBadge className="absolute -top-3 right-6 rotate-2 rounded-none bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {t.badge ?? 'Popular'}
                    </PricingTierBadge>
                  ) : null}
                  <PricingTierHeader className="gap-0">
                    <MonoTag
                      aria-hidden="true"
                      tone={isFeatured ? 'inverted' : 'muted'}
                    >
                      {String(index + 1).padStart(2, '0')} / plan
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 font-serif text-xl font-semibold tracking-tight',
                        isFeatured ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {t.name}
                    </PricingTierName>
                    {blurb ? (
                      <PricingTierTagline
                        className={cn(
                          'mt-2',
                          isFeatured ? 'text-background/70' : undefined,
                        )}
                      >
                        {blurb}
                      </PricingTierTagline>
                    ) : null}
                    <span className="mt-6 flex items-baseline gap-2">
                      <PricingTierPrice
                        className={cn(
                          'text-5xl font-extrabold leading-none tracking-tight tabular-nums sm:text-5xl',
                          isFeatured ? 'text-background' : 'text-foreground',
                        )}
                      >
                        {t.price}
                      </PricingTierPrice>
                      {period ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {period}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features ? (
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
                  ) : null}
                  {t.cta ? (
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
                  ) : null}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
