import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { directoryLakebed } from './directory-lakebed.ts'

/**
 * DirectoryPricing — 3-tier business-listing pricing table for a local-business
 * directory. A card-surface section with a centered heading + description and a
 * responsive 3-column grid of plan cards: each has an uppercase plan name, a big
 * price with optional period, a tagline, an included-features list with primary
 * check icons plus an excluded-features list with muted cross icons, and a
 * full-width CTA button. A highlighted "Most Popular" plan inverts to a dark
 * foreground surface with a floating badge. CTAs record real Lakebed lead
 * actions. Use as the listing/subscription pricing section on local directories,
 * marketplaces, or find-a-service platforms.
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
  PricingTierCta,
} from '#/section-kit/PricingGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const DirectoryPricing = defineCapsule({
  name: 'DirectoryPricing',
  description:
    '3-tier business-listing pricing table for a local-business DIRECTORY: a card-surface section with a centered heading and description and a responsive 3-column grid of plan cards — each has an uppercase plan name, a big price with optional period, a tagline, an included-features list with primary check icons plus an excluded-features list with muted cross icons, and a full-width CTA button. A highlighted Most Popular plan inverts to a dark foreground surface with a floating badge. CTAs record real Lakebed lead actions. Use as the listing or subscription pricing section on local directories, business-listing marketplaces, or find-a-service platforms.',
  lakebed: directoryLakebed,
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string(),
          tagline: z.string(),
          features: z.array(z.string()),
          excluded: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean(),
          badge: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'List Your Business'
    const description =
      props.description ??
      'Choose the plan that works for your business. Start free and upgrade as you grow.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Basic',
            price: 'Free',
            period: '',
            tagline: 'Perfect for getting started',
            features: [
              'Basic business listing',
              'Contact information',
              'Customer reviews',
            ],
            excluded: ['Photos & media', 'Priority placement'],
            cta: 'Get Started Free',
            featured: false,
            badge: '',
          },
          {
            name: 'Premium',
            price: '$29',
            period: '/month',
            tagline: 'Best for growing businesses',
            features: [
              'Everything in Basic',
              'Up to 20 photos',
              'Business description',
              'Priority search results',
              'Analytics dashboard',
            ],
            excluded: [],
            cta: 'Start 14-Day Trial',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Enterprise',
            price: '$79',
            period: '/month',
            tagline: 'For multi-location businesses',
            features: [
              'Everything in Premium',
              'Multiple locations (5+)',
              'Unlimited photos',
              'Featured placement',
              'Dedicated support',
            ],
            excluded: [],
            cta: 'Contact Sales',
            featured: false,
            badge: '',
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
    void Check
    void Cross
    void lakebed
    return (
      <section className={cn('bg-card py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8',
              props.className,
            )}
          >
            <SectionHeading
              title={'List Your Business'}
              subtitle={
                'Choose the plan that works for your business. Start free and upgrade as you grow.'
              }
            />
            {plans.map((tier) => {
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
              return (
                <PricingTier
                  key={t.name}
                  variant={
                    t.highlighted || t.featured || t.popular
                      ? 'highlighted'
                      : undefined
                  }
                >
                  {t.highlighted || t.featured || t.popular ? (
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
                    <PricingTierPrice>{t.price}</PricingTierPrice>
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
                    <PricingTierFeatures>
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
                    <PricingTierCta target={t.ctaTarget}>
                      {t.cta}
                    </PricingTierCta>
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
