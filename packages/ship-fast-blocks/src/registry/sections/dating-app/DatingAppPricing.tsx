import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * DatingAppPricing — a 3-tier pricing table for a dating / matchmaking app. Sits on
 * a soft muted band: a centered heading + supporting paragraph above three card
 * tiers, where the featured tier gains a primary ring, shadow, and a centered
 * "Most Popular" badge. Each card shows name, tagline, big price + period, a
 * check/cross feature checklist, and a full-width CTA (filled for the featured tier,
 * outlined otherwise) routed through useNavigate. Use to present Free / Premium /
 * Elite plans for dating apps, singles platforms, or subscription products.
 * Renders fully with no props via baked-in tier defaults.
 */
export const DatingAppPricing = defineCapsule({
  name: 'DatingAppPricing',
  description:
    "3-tier pricing table for a dating / matchmaking app on a soft muted band: a centered heading + supporting paragraph above three card tiers, where the featured tier gains a primary ring, shadow, and a centered 'Most Popular' badge. Each card shows name, tagline, big price + period, a check/cross feature checklist, and a full-width CTA (filled for the featured tier, outlined otherwise) routed through useNavigate. Use to present Free / Premium / Elite plans for dating apps, singles platforms, or subscription products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          tagline: z.string(),
          price: z.string(),
          period: z.string(),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
          features: z.array(
            z.object({ label: z.string(), included: z.boolean() }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pricingHeading = props.heading ?? 'Choose your journey'
    const pricingDesc =
      props.description ??
      "Start free, upgrade when you're ready for more connections."
    const pricingTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Free',
            tagline: 'Get started with the basics',
            price: '$0',
            period: '/month',
            cta: 'Get Started',
            featured: false,
            features: [
              { label: '10 likes per day', included: true },
              { label: 'Basic matching', included: true },
              { label: 'Chat with matches', included: true },
              { label: 'See who liked you', included: false },
            ],
          },
          {
            name: 'Premium',
            tagline: 'Unlock your full potential',
            price: '$29',
            period: '/month',
            cta: 'Start Free Trial',
            featured: true,
            badge: 'Most Popular',
            features: [
              { label: 'Unlimited likes', included: true },
              { label: 'See who liked you', included: true },
              { label: 'Advanced filters', included: true },
              { label: 'Video dates included', included: true },
              { label: 'Priority support', included: true },
            ],
          },
          {
            name: 'Elite',
            tagline: 'The ultimate experience',
            price: '$49',
            period: '/month',
            cta: 'Go Elite',
            featured: false,
            features: [
              { label: 'Everything in Premium', included: true },
              { label: 'Profile boost monthly', included: true },
              { label: 'Read receipts', included: true },
              { label: 'Exclusive events access', included: true },
            ],
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
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

    const Cross = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    void Check
    void Cross
    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {pricingHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{pricingDesc}</p>
          </div>
          <PricingGrid
            tiers={pricingTiers.map((t) => ({
              ...t,
              features: Array.isArray(t.features)
                ? t.features.map((f) => (typeof f === 'string' ? f : f.label))
                : t.features,
            }))}
            className={cn(
              'mx-auto grid max-w-5xl gap-8 md:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
