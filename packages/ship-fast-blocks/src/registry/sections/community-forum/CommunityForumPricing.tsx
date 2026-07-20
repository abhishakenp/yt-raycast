import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CommunityForumPricing — playful-geometric 3-tier pricing table for a
 * community-platform / discussion-forum landing page. A muted band with a
 * giant ghost "$" watermark and an asymmetric header (mono "07 / pricing"
 * rail + left-aligned tight-tracked heading and lead, mono "[ no hidden
 * fees ]" meta right) above the shared `PricingGrid`: sharp-cornered
 * bordered tier cards, the featured tier tilted -1deg, raised, and sitting on
 * a hard offset primary shadow with a rotated rounded-full sticker badge.
 * Each card shows the tier name, a giant extrabold price with mono cadence,
 * a mono-labeled description, a checkmark feature list, and a rounded-full
 * CTA pill with press feedback. All buttons route through section-kit route
 * links. Use as the pricing section for SaaS community-platform products,
 * subscription services, or membership tools.
 */
export const CommunityForumPricing = defineCapsule({
  name: 'CommunityForumPricing',
  description:
    'Playful-geometric 3-tier pricing table for a community-platform / discussion-forum landing page: a muted band with a giant ghost "$" watermark and an asymmetric header (mono metadata rail + left-aligned tight-tracked heading, mono meta tag right) above sharp-cornered bordered tier cards — the featured tier tilted, raised, and sitting on a hard offset primary shadow with a rotated rounded-full sticker badge. Each card shows the tier name, a giant extrabold price with cadence, description, checkmark feature list, and a rounded-full CTA pill with press feedback; all buttons route through section-kit route links. Use as the pricing section for SaaS community-platform products, subscription services, or membership tools.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing tiers: name, price, cadence, description, features, cta, featured flag, badge. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          cadence: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Simple, transparent pricing'
    const description =
      props.description ??
      'Start free and scale as your community grows. No hidden fees, no surprises.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Starter',
            price: '$0',
            cadence: 'Forever free',
            description:
              'Perfect for small groups getting started with community building.',
            features: [
              'Up to 100 members',
              '5 topic categories',
              'Basic analytics',
              'Community support',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Growth',
            price: '$49',
            cadence: 'per month',
            description:
              'For growing communities that need more power and flexibility.',
            features: [
              'Up to 5,000 members',
              'Unlimited categories',
              'Advanced analytics',
              'Priority email support',
              'Custom domain',
            ],
            cta: 'Start 14-Day Trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            price: '$299',
            cadence: 'per month',
            description:
              'For large organizations with advanced security and scaling needs.',
            features: [
              'Unlimited members',
              'SSO & SAML',
              'API access',
              'Dedicated support',
              'SLA guarantee',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 bottom-4 text-[10rem] sm:text-[15rem] lg:text-[20rem]">
          $
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag>07 / Pricing</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:mb-2"
            >
              [ no hidden fees ]
            </MonoTag>
          </div>
          <div className="mx-auto max-w-5xl">
            <PricingGrid className="items-stretch gap-5 pt-4 sm:gap-6">
              {tiers
                .map((tier) => ({
                  name: tier.name,
                  price: tier.price,
                  period: tier.cadence,
                  features: tier.features,
                  cta: tier.cta,
                  highlighted: tier.featured,
                  description: tier.description,
                  badge: tier.badge,
                }))
                .map((tier, i) => {
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
                        'gap-6 rounded-none border-2 bg-card p-6 shadow-none sm:p-7',
                        isFeatured
                          ? 'z-10 -rotate-1 border-foreground bg-card shadow-[6px_6px_0_0] shadow-primary/30 ring-0 lg:-translate-y-4'
                          : 'border-foreground/15',
                        i === 0 && 'lg:rotate-1',
                        i === 2 && 'lg:rotate-1 lg:translate-y-2',
                      )}
                    >
                      {isFeatured ? (
                        <PricingTierBadge className="absolute -top-3.5 right-5 rotate-2 rounded-full border-2 border-background px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] shadow-[2px_2px_0_0] shadow-foreground/25">
                          {t.badge ?? 'Popular'}
                        </PricingTierBadge>
                      ) : null}
                      <PricingTierHeader className="gap-3">
                        <PricingTierName className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {t.name}
                        </PricingTierName>
                        <span className="flex items-baseline gap-2">
                          <PricingTierPrice className="text-5xl font-extrabold leading-none tracking-tighter tabular-nums sm:text-6xl">
                            {t.price}
                          </PricingTierPrice>
                          {t.period && (
                            <PricingTierPeriod className="font-mono text-[11px] uppercase tracking-[0.12em]">
                              {t.period}
                            </PricingTierPeriod>
                          )}
                        </span>
                        {t.tagline && (
                          <PricingTierTagline>{t.tagline}</PricingTierTagline>
                        )}
                        {t.blurb && (
                          <PricingTierTagline>{t.blurb}</PricingTierTagline>
                        )}
                        {t.description && (
                          <PricingTierTagline>
                            {t.description}
                          </PricingTierTagline>
                        )}
                        {t.audience && (
                          <PricingTierTagline>{t.audience}</PricingTierTagline>
                        )}
                        {t.unit && (
                          <PricingTierPeriod>{t.unit}</PricingTierPeriod>
                        )}
                        {t.cadence && (
                          <PricingTierPeriod>{t.cadence}</PricingTierPeriod>
                        )}
                        {t.suffix && (
                          <PricingTierPeriod>{t.suffix}</PricingTierPeriod>
                        )}
                      </PricingTierHeader>
                      {t.features && (
                        <PricingTierFeatures className="border-t border-border pt-5">
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
                      {t.cta && (
                        <PricingTierCta
                          target={t.ctaTarget}
                          className={cn(
                            'rounded-full text-sm font-semibold transition-all duration-150 active:translate-y-px',
                            isFeatured
                              ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground/20 hover:-translate-y-0.5 active:shadow-none'
                              : 'border-2 border-foreground/20 bg-background text-foreground hover:border-foreground/40 hover:bg-muted',
                          )}
                        >
                          {t.cta}
                        </PricingTierCta>
                      )}
                    </PricingTier>
                  )
                })}
            </PricingGrid>
          </div>
        </Container>
      </section>
    )
  },
})
