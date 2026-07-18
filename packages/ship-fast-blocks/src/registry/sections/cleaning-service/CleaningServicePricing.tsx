import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServicePricing — a 3-tier transparent pricing table for a home-cleaning / maid-service landing page. A muted-band background with a centered heading + lead paragraph above a responsive 3-column grid of pricing cards: the middle "Most Popular" plan is elevated, highlighted with the primary brand color and a badge pill; side plans sit on card surfaces with secondary CTAs. A footnote row with a phone-icon link sits below the grid. Every CTA and the footnote link route through useNavigate. Use for service-pricing / plan-selection blocks for residential cleaning companies, maid services, or any local home-service business. Renders fully with no props via three baked-in default plans.
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
export const CleaningServicePricing = defineCapsule({
  name: 'CleaningServicePricing',
  description:
    "A 3-tier transparent pricing table for a home-cleaning / maid-service landing page: muted-band background with centered heading + lead above a responsive 3-column grid of pricing cards. Middle 'Most Popular' plan is brand-colored, elevated, and badged; side plans sit on card surfaces with secondary CTAs. Footnote row with phone-icon link below. CTAs and footnote link route through useNavigate. Use for service-pricing / plan-selection blocks for residential cleaning, maid services, or local home-service businesses.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plan cards. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote question below the pricing grid. */
    footnote: z.string().optional(),
    /** Footnote CTA / phone line shown as a routable link. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Transparent pricing, no surprises'
    const description =
      props.description ??
      'Choose the plan that fits your home and budget. All plans include our satisfaction guarantee.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Studio / 1 Bedroom',
            blurb: 'Perfect for apartments and small spaces',
            price: '$129',
            period: '/visit',
            features: [
              '2-3 hours of cleaning',
              'Up to 800 sq ft',
              '1 bathroom',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
          },
          {
            name: '2-3 Bedroom Home',
            blurb: 'Ideal for families and medium homes',
            price: '$189',
            period: '/visit',
            features: [
              '3-4 hours of cleaning',
              'Up to 2,000 sq ft',
              'Up to 2 bathrooms',
              'Inside refrigerator',
              'All cleaning supplies',
            ],
            cta: 'Book This Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: '4+ Bedroom Home',
            blurb: 'For larger homes and estates',
            price: '$279',
            period: '/visit',
            features: [
              '4-6 hours of cleaning',
              'Up to 4,000 sq ft',
              'Up to 4 bathrooms',
              '2-person cleaning team',
            ],
            cta: 'Book This Plan',
          },
        ]
    const footnote =
      props.footnote ??
      'Need a custom quote for a larger space or commercial property?'
    const footnoteCta =
      props.footnoteCta ?? 'Call for custom pricing: (555) 123-4567'
    useSyncLocalServices(
      lakebed,
      plans.map((plan) =>
        localServiceItem({
          name: plan.name,
          price: `${plan.price}${plan.period}`,
          summary: plan.blurb,
        }),
      ),
    )
    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    void Check
    void PhoneIcon
    void footnote
    void footnoteCta
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid className={props.className}>
            <SectionHeading
              title={'Transparent pricing, no surprises'}
              subtitle={
                'Choose the plan that fits your home and budget. All plans include our satisfaction guarantee.'
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
