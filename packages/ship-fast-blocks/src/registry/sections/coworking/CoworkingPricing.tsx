import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Sparkles } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { GridField } from '#/section-kit/motion.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
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
/**
 * CoworkingPricing — calm, dimensional membership pricing for a coworking or
 * shared-workspace page. An asymmetric 7:5 editorial header (mono index
 * eyebrow chip "03 / Membership plans" + display heading left, supporting
 * line right) above a grid of frosted glass tier cards. Each card has a
 * gradient hairline, a large tracked price, a hairline-ledger benefit list
 * (collapsed dividers between rows), and a full-width CTA with press
 * feedback; the highlighted tier is elevated — lifted on desktop with a
 * primary ring and a "Popular" pill — and gets a filled primary CTA. A
 * collapsed-border mono reassurance ledger (no setup fees / month-to-month /
 * cancel anytime) closes the section, and the backdrop continues the page's
 * light-field (hairline rails, seam hairline). Any tier count renders
 * cleanly. CTAs route through section-kit route links. Use to convert
 * prospective members for coworking spaces, shared offices, or flex-office
 * providers.
 */
export const CoworkingPricing = defineCapsule({
  name: 'CoworkingPricing',
  description:
    "Calm dimensional membership pricing for a coworking or shared-workspace page: asymmetric 7:5 editorial header (mono index eyebrow chip + display heading left, supporting line right) above frosted glass tier cards — gradient hairlines, large tracked prices, hairline-ledger benefit lists, full-width press-feedback CTAs. The highlighted tier is lifted on desktop with a primary ring, 'Popular' pill, and filled primary CTA; a collapsed-border mono reassurance ledger (no setup fees, month-to-month, cancel anytime) closes the section over a connected light-field backdrop. CTAs route through section-kit route links. Use to convert prospective members for coworking spaces, shared offices, or flex-office providers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Membership tiers — name, price, period, features, cta, highlighted. */
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
  component: ({ props }) => {
    const heading =
      typeof props.heading === 'string' && props.heading
        ? props.heading
        : 'Simple, month-to-month memberships'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'No long-term contracts and no setup fees — pick the plan that fits how you work and upgrade anytime.'
    const defaults = [
      {
        name: 'Hot Desk',
        price: '$199',
        period: '/mo',
        features: [
          'Any open desk, first come first served',
          'Business-hours access (8am–8pm)',
          'Unlimited WiFi & free coffee',
          '5 hours of meeting-room credits',
        ],
        cta: 'Start with Hot Desk',
        ctaTarget: 'Book a Tour',
        highlighted: false,
      },
      {
        name: 'Dedicated Desk',
        price: '$349',
        period: '/mo',
        features: [
          'Your own desk, locked drawer & monitor arm',
          '24/7 keycard access',
          'Unlimited WiFi & free coffee',
          '15 hours of meeting-room credits',
          'Business address & mail handling',
        ],
        cta: 'Get a Dedicated Desk',
        ctaTarget: 'Book a Tour',
        highlighted: true,
      },
      {
        name: 'Private Office',
        price: '$1,200',
        period: '/mo',
        features: [
          'Lockable private suite for 2–6 people',
          '24/7 keycard access',
          'Unlimited WiFi & free coffee',
          'Unlimited meeting-room access',
          'Branded signage & dedicated phone line',
        ],
        cta: 'Tour an Office',
        ctaTarget: 'Book a Tour',
        highlighted: false,
      },
    ]
    const authored = props.tiers
      ?.filter(Boolean)
      .filter((tier) => typeof tier?.name === 'string')
    const tiers = authored?.length ? authored : defaults
    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        />
        <GridField
          className="-z-10 text-foreground/[0.045]"
          size={64}
          mask="radial-gradient(ellipse 90% 75% at 50% 30%, black 25%, transparent 80%)"
        />
        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div className="grid items-end gap-6 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <Eyebrow
                variant="default"
                icon={
                  <Sparkles
                    className="size-3.5 text-primary"
                    aria-hidden="true"
                  />
                }
                className="border-border/60 bg-card/70 px-4 py-1.5 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground backdrop-blur"
              >
                03 / Membership plans
              </Eyebrow>
              <SectionHeading
                align="left"
                title={heading}
                className="mt-5 max-w-xl gap-0"
                titleClassName="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {subheading}
            </p>
          </div>
          <PricingGrid className="mx-auto mt-16 grid max-w-md grid-cols-1 items-stretch gap-7 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
              const isHighlighted = Boolean(
                t.highlighted || t.featured || t.popular,
              )
              return (
                <PricingTier
                  key={t.name}
                  variant={isHighlighted ? 'highlighted' : undefined}
                  className={cn(
                    'rounded-3xl border-border/60 bg-card/70 backdrop-blur transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10',
                    isHighlighted &&
                      'border-primary/40 bg-card/85 lg:-translate-y-4',
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
                      isHighlighted ? 'via-primary/60' : 'via-border',
                    )}
                  />
                  {isHighlighted ? (
                    <PricingTierBadge>{t.badge ?? 'Popular'}</PricingTierBadge>
                  ) : null}
                  <PricingTierHeader>
                    <PricingTierName>{t.name}</PricingTierName>
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
                    <PricingTierPrice className="text-4xl font-semibold tracking-tight sm:text-5xl">
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
                    <PricingTierFeatures className="gap-0 divide-y divide-border/40 border-t border-border/40">
                      {t.features.map((feature) => (
                        <PricingTierFeature
                          key={
                            typeof feature === 'string'
                              ? feature
                              : (feature as { label: string }).label
                          }
                          className="py-3"
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
                        'rounded-2xl font-semibold transition-all duration-300 active:translate-y-px',
                        isHighlighted
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35'
                          : 'border border-border/70 bg-background/60 text-foreground backdrop-blur hover:bg-card',
                      )}
                    >
                      {t.cta}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
          <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 divide-x divide-border/60 border-y border-border/60">
            {['No setup fees', 'Month-to-month', 'Cancel anytime'].map(
              (assurance) => (
                <MonoTag
                  key={assurance}
                  className="px-2 py-3.5 text-center tracking-[0.14em]"
                >
                  {assurance}
                </MonoTag>
              ),
            )}
          </div>
        </Container>
      </section>
    )
  },
})
