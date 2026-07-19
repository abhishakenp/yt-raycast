import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorPricing — an "Investment" pricing table for a film director or
 * cinematographer. On a muted band: a centered header (thin heading + muted
 * lede) above a 3-column grid of tier cards — standard tiers are bordered card
 * surfaces while the highlighted tier inverts to a dark foreground card with a
 * corner "Most Popular" ribbon. Each card shows an uppercase tier name, a big
 * thin price with optional suffix, a short description, a check-marked feature
 * list, and a full-width CTA button that routes through useNavigate. Use to
 * present project-scope packages (concept-to-delivery production services) for
 * filmmakers, directors, DPs, or video production houses.
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
export const FilmDirectorPricing = defineCapsule({
  name: 'FilmDirectorPricing',
  description:
    'Investment pricing table for a film director or cinematographer: on a muted band, a centered header (thin heading + muted lede) above a 3-column grid of tier cards where standard tiers are bordered card surfaces while the highlighted tier inverts to a dark foreground card with a corner Most-Popular ribbon. Each card shows an uppercase tier name, a big thin price with optional suffix, a short description, a check-marked feature list, and a full-width CTA button routed through useNavigate. Use to present project-scope packages (concept-to-delivery production services) for filmmakers, directors, DPs, or video production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          suffix: z.string().optional(),
          description: z.string(),
          features: z.array(z.string()),
          cta: z.string(),
          popular: z.boolean().optional(),
          popularLabel: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingHeading = props.heading ?? 'Investment'
    const pricingDesc =
      props.description ??
      'Transparent pricing for different project scopes. Every package includes full production services from concept to delivery.'
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Essential',
            price: '$15,000',
            suffix: '+',
            description:
              'Perfect for brand stories, testimonials, and social content.',
            features: [
              '1 day of production',
              '1-2 minute final cut',
              'Basic color grading',
              '2 revision rounds',
              'Licensed music',
            ],
            cta: 'Get Started',
          },
          {
            name: 'Professional',
            price: '$35,000',
            suffix: '+',
            description:
              'Comprehensive campaigns, brand films, and commercial spots.',
            features: [
              '2-3 days of production',
              '2-3 minute final cut',
              'Premium color grade',
              'Custom sound design',
              '3 revision rounds',
              'Multiple deliverables',
            ],
            cta: 'Get Started',
            popular: true,
            popularLabel: 'Most Popular',
          },
          {
            name: 'Premium',
            price: 'Custom',
            description:
              'Multi-spot campaigns, documentary series, and high-end productions.',
            features: [
              'Multi-day production',
              'Multiple deliverables',
              'Feature-film quality',
              'Dedicated post team',
              'Unlimted revisions',
              'Global locations',
            ],
            cta: 'Contact for Quote',
          },
        ]
    return (
      <section
        className={cn(
          'bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            title={pricingHeading}
            subtitle={pricingDesc}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-light md:text-4xl"
            subtitleClassName="text-muted-foreground"
          />
          <PricingGrid
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            {pricingTiers.map((tier) => {
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
