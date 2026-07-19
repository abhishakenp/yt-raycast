import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BootcampPricing — 3-tier pricing / financing comparison for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description above
 * a responsive 3-column grid of plan cards; each card shows a name, blurb, price,
 * feature list with check-icon bullets, and a CTA button. One plan can be
 * highlighted with a primary border and a floating badge. A footnote row with a
 * clickable CTA link sits below the grid. Every interaction routes through
 * useNavigate. Use as the pricing table for bootcamps, academies, or vocational
 * programs offering multiple payment options.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
export const BootcampPricing = defineCapsule({
  name: 'BootcampPricing',
  description:
    '3-tier pricing / financing comparison for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 3-column grid of plan cards. Each card shows name, blurb, price, feature list with check-icon bullets, and a CTA button. One plan can be highlighted with a primary border and floating badge. A footnote row with a clickable CTA link sits below. All routes through useNavigate. Use as the pricing table for bootcamps, academies, or vocational programs offering multiple payment options.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Pricing plans: name, description, price, unit, features, CTA, optional featured flag and badge. */
    items: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string(),
          price: z.string(),
          unit: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Footnote text under the grid. */
    footnote: z.string().optional(),
    /** Clickable CTA link text in the footnote. */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const pricingEyebrow = props.eyebrow ?? 'Investment'
    const pricingHeading = props.heading ?? 'Flexible payment options'
    const pricingDesc =
      props.description ??
      'Choose the plan that works for your financial situation. All options include the same curriculum and job guarantee.'
    const pricingItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Upfront Payment',
            blurb: 'Pay in full before the cohort starts',
            price: '$12,500',
            unit: 'one-time',
            features: [
              'Save $2,000 vs. other options',
              'No future payments',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
          },
          {
            name: 'Monthly Payment',
            blurb: 'Spread the cost over 12 months',
            price: '$1,125',
            unit: '/month',
            features: [
              '0% interest financing',
              'No credit check required',
              'Job guarantee included',
            ],
            cta: 'Select Plan',
            featured: true,
            badge: 'Most Popular',
          },
          {
            name: 'Income Share',
            blurb: 'Pay nothing until you earn $50k+',
            price: '$0',
            unit: 'upfront',
            features: [
              '10% of income for 24 months',
              'Capped at $16,500 total',
              'Only pay if you succeed',
            ],
            cta: 'Select Plan',
          },
        ]
    const pricingFootnote =
      props.footnote ??
      'Scholarships available for underrepresented groups in tech.'
    const pricingFootnoteCta = props.footnoteCta ?? 'Learn more →'
    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )
    void Check
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={pricingEyebrow}
            title={pricingHeading}
            subtitle={pricingDesc}
            className="mb-16 lg:mb-20 max-w-3xl gap-0"
            eyebrowClassName="mb-4 inline-block text-xs font-semibold tracking-wider text-primary"
            titleClassName="mb-4 text-3xl font-bold sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            {pricingItems.map((tier) => {
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
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {pricingFootnote}{' '}
            <button
              type="button"
              onClick={() => go(pricingFootnoteCta)}
              className="text-primary hover:underline"
            >
              {pricingFootnoteCta}
            </button>
          </p>
        </Container>
      </section>
    )
  },
})
