import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporatePricing — transparent 3-tier pricing table for an enterprise / corporate
 * B2B site. A centered heading above a responsive 1/2/3-column grid of pricing
 * cards on a muted band; the middle card can be featured with an inverted dark
 * style and a floating "Most Popular" badge. Every card lists plan name, blurb,
 * price, a feature checklist, and a CTA button that routes through useNavigate.
 * Use for SaaS, managed services, or enterprise software pricing pages.
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
export const CorporatePricing = defineCapsule({
  name: 'CorporatePricing',
  description:
    "Transparent 3-tier pricing table for an enterprise / corporate B2B site: centered heading above a responsive 1/2/3-column grid of pricing cards on a muted band, with an optional featured dark middle card and a floating 'Most Popular' badge. Each card lists plan name, blurb, price, feature checklist, and a CTA button routing through useNavigate. Use for SaaS, managed services, or enterprise software pricing.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          period: z.string().optional(),
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
    const heading = props.heading ?? 'Transparent enterprise pricing'
    const description =
      props.description ??
      'Flexible plans designed to scale with your organization. All plans include implementation support.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Professional',
            blurb: 'For growing teams up to 250 employees',
            price: '$2,500',
            period: '/month',
            features: [
              'Up to 5 cloud environments',
              '24/7 email and chat support',
              'Standard security features',
              'Basic analytics dashboard',
              'Quarterly business reviews',
            ],
            cta: 'Get Started',
            featured: false,
          },
          {
            name: 'Enterprise',
            blurb: 'For mid-size organizations up to 5,000 employees',
            price: '$8,500',
            period: '/month',
            features: [
              'Unlimited cloud environments',
              '24/7 phone, email & chat support',
              'Advanced security & compliance',
              'Custom analytics & AI insights',
              'Monthly business reviews',
              'Dedicated success manager',
            ],
            cta: 'Contact Sales',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Global',
            blurb: 'For large enterprises with 5,000+ employees',
            price: 'Custom',
            period: '',
            features: [
              'Everything in Enterprise',
              'Multi-region deployment',
              'Custom SLAs & contracts',
              'On-premise deployment options',
              'Executive advisory board access',
            ],
            cta: 'Contact Sales',
            featured: false,
          },
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    void Check
    return (
      <section className={cn('bg-muted/50 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-6xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Transparent enterprise pricing'}
              subtitle={
                'Flexible plans designed to scale with your organization. All plans include implementation support.'
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
