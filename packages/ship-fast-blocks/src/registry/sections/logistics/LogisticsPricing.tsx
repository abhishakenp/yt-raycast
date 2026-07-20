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

/**
 * LogisticsPricing — an industrial-manifest collapsed-border service-tier ledger
 * for a global-logistics / freight-forwarding company backed by shared Lakebed
 * conversion state. An asymmetric header (marker-highlighted heading left, mono
 * `[ tiers ]` meta right) above a sharp-cornered, collapsed-border 3-tier ledger:
 * each cell carries a mono plan index, name, tagline, a giant tabular-nums price
 * with a mono unit, a hairline-divided feature checklist, and a full-width square
 * mutation CTA with a hard offset shadow and press feedback. The featured tier
 * inverts to `bg-foreground text-background` with a rotated `Popular` marker chip.
 * Plans seed command search and every CTA records the selected plan or sales
 * intent to shared Lakebed state; a mono footnote sits below. Tokens-only. Use to
 * present shipping service tiers (Standard / Priority / Express) for logistics,
 * freight-forwarding, shipping, courier or cargo/transport companies. Renders
 * fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
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
export const LogisticsPricing = defineCapsule({
  name: 'LogisticsPricing',
  description:
    'Industrial-manifest collapsed-border service-tier ledger for a global-logistics / freight-forwarding company backed by shared Lakebed conversion state: an asymmetric header (marker-highlighted heading left, mono meta right) above a sharp-cornered 3-tier collapsed-border ledger with mono plan indexes, giant tabular-nums prices, mono units, hairline feature checklists, and square hard-shadow mutation CTAs with press feedback; the featured tier inverts to a dark surface with a rotated Popular chip. Plans seed command search and every CTA records selected plan or sales intent; a mono footnote sits below. Use to present shipping service tiers (Standard / Priority / Express) for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    footnote: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          badge: z.string().optional(),
          featured: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Service tiers'
    const description =
      props.description ??
      'Choose the service level that matches your timeline and budget.'
    const footnote =
      props.footnote ??
      'Ocean freight rates from $85/CBM. Ground transport from $1.45/mile. Volume discounts available.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Standard',
            tagline: 'Economy shipping for non-urgent cargo',
            price: '$2.80',
            unit: '/kg air',
            features: [
              '5-7 day air transit',
              'Standard tracking',
              '$100 insurance included',
              'Email support',
            ],
            cta: 'Get a quote',
          },
          {
            name: 'Priority',
            tagline: 'Best balance of speed and cost',
            price: '$4.50',
            unit: '/kg air',
            features: [
              '2-4 day air transit',
              'Real-time GPS tracking',
              '$500 insurance included',
              '24/7 phone & email support',
              'Customs brokerage',
            ],
            cta: 'Get a quote',
            badge: 'Popular',
            featured: true,
          },
          {
            name: 'Express',
            tagline: 'When every hour counts',
            price: '$8.90',
            unit: '/kg air',
            features: [
              'Next-flight-out (NFO)',
              'Real-time GPS + EDI',
              '$2,500 insurance included',
              'Dedicated account manager',
              'Charter options available',
            ],
            cta: 'Contact sales',
          },
        ]
    useSyncSaasPlans(
      lakebed,
      tiers.map((tier) =>
        saasPlan({
          name: tier.name,
          period: tier.unit,
          price: tier.price,
          summary: tier.tagline || tier.features.at(0) || '',
        }),
      ),
    )
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Tiers
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · air freight
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ tiers ] per kg
            </p>
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
              const unit = t.period || t.unit || t.cadence || t.suffix
              return (
                <PricingTier
                  key={t.name}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border p-6 shadow-none sm:p-8 lg:p-8',
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
                      {String(index + 1).padStart(2, '0')} / tier
                    </MonoTag>
                    <PricingTierName
                      className={cn(
                        'mt-3 text-xl font-bold tracking-tight',
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
                      {unit ? (
                        <PricingTierPeriod
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.12em]',
                            isFeatured ? 'text-background/60' : undefined,
                          )}
                        >
                          {unit}
                        </PricingTierPeriod>
                      ) : null}
                    </span>
                  </PricingTierHeader>
                  {t.features && (
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
                  )}
                  {t.cta && (
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
                        'mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70',
                        isFeatured
                          ? 'bg-background text-foreground shadow-[4px_4px_0_0] shadow-background/30 hover:bg-background/90'
                          : 'border border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground hover:bg-muted',
                      )}
                    >
                      {t.cta}
                    </SaasPlanActionButton>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>

          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {footnote}
          </p>
        </Container>
      </section>
    )
  },
})
