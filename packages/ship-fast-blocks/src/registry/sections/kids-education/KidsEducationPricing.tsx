import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationPricing — friendly 3-tier pricing table for a kids / family
 * learning platform. A centered eyebrow + heading + description intro above a
 * responsive 3-up grid of rounded plan cards; the highlighted "Most Popular"
 * plan inverts to a dark surface, lifts on desktop, and shows a floating badge.
 * Each card lists name, tagline, price + period, a checkmarked feature list, and
 * a full-width pill CTA, with a reassurance note centered below. CTAs route
 * through useNavigate. Use for subscription tiers on kids-education startups,
 * children's e-learning platforms, tutoring services, and family learning apps.
 * Renders fully with no props via baked-in defaults.
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
export const KidsEducationPricing = defineCapsule({
  name: 'KidsEducationPricing',
  description:
    "Friendly 3-tier pricing table for a kids / family learning platform: a centered eyebrow + heading + description intro above a responsive 3-up grid of rounded plan cards; the highlighted 'Most Popular' plan inverts to a dark surface, lifts on desktop, and shows a floating badge. Each card lists name, tagline, price + period, a checkmarked feature list, and a full-width pill CTA, with a reassurance note centered below. CTAs route through useNavigate. Use for subscription tiers on kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Reassurance note centered beneath the plans. */
    note: z.string().optional(),
    /** Pricing plans. */
    plans: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
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
    const eyebrow = props.eyebrow ?? 'Pricing'
    const heading = props.heading ?? 'Simple, Transparent Pricing'
    const description =
      props.description ??
      'Choose the plan that works for your family. All plans include a 14-day free trial.'
    const note =
      props.note ??
      'All plans include a 14-day free trial. No credit card required.'
    const plans = props.plans?.length
      ? props.plans
      : [
          {
            name: 'Starter',
            tagline: 'Perfect for trying out',
            price: '$0',
            period: '/month',
            features: [
              '3 activities per day',
              '1 child profile',
              'Basic progress tracking',
              'Community support',
            ],
            cta: 'Get Started Free',
          },
          {
            name: 'Family',
            tagline: 'Best for growing families',
            price: '$12',
            period: '/month',
            features: [
              'Unlimited activities',
              'Up to 4 child profiles',
              'Detailed progress reports',
              'Offline activity downloads',
              'Priority email support',
            ],
            cta: 'Start Free Trial',
            popular: true,
            popularLabel: 'Most Popular',
          },
          {
            name: 'School',
            tagline: 'For classrooms & educators',
            price: '$49',
            period: '/month',
            features: [
              'Up to 30 student profiles',
              'Teacher dashboard',
              'Classroom management',
              'Dedicated account manager',
            ],
            cta: 'Contact Sales',
          },
        ]
    const CheckMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    void CheckMark
    void note
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 text-sm tracking-wider text-secondary"
            titleClassName="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <PricingGrid
            className={cn(
              'mx-auto grid max-w-6xl gap-8 md:grid-cols-3',
              props.className,
            )}
          >
            <SectionHeading
              title={'Simple, Transparent Pricing'}
              subtitle={
                'Choose the plan that works for your family. All plans include a 14-day free trial.'
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
