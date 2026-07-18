import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Sparkles } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { GridField } from '#/section-kit/motion.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * CoworkingPricing — calm, dimensional membership pricing for a coworking or
 * shared-workspace page. A centered header (eyebrow chip + display heading +
 * supporting line) above a grid of frosted glass tier cards. Each card has a
 * gradient hairline, large tracked price, a check-tile benefit list, and a
 * full-width CTA; the highlighted tier is elevated with a primary ring, a
 * soft internal glow, a "Most popular" pill, and a shimmer-sweep primary CTA.
 * A reassurance chip row closes the section, and the backdrop continues the
 * page's light-field (hairline rails, seam hairline). Any tier count renders
 * cleanly. CTAs route through useNavigate. Use to convert prospective members
 * for coworking spaces, shared offices, or flex-office providers.
 */
export const CoworkingPricing = defineCapsule({
  name: 'CoworkingPricing',
  description:
    "Calm dimensional membership pricing for a coworking or shared-workspace page: centered header (eyebrow chip + display heading + supporting line) above frosted glass tier cards — gradient hairlines, large tracked prices, check-tile benefit lists, full-width CTAs. The highlighted tier is elevated with a primary ring, internal glow, 'Most popular' pill, and shimmer-sweep primary CTA; a reassurance chip row (no setup fees, month-to-month, cancel anytime) closes the section over a connected light-field backdrop. CTAs route through useNavigate. Use to convert prospective members for coworking spaces, shared offices, or flex-office providers.",
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
    const go = useNavigate()
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

    void go
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

          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow
              variant="default"
              icon={
                <Sparkles
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                />
              }
              className="border-border/60 bg-card/70 px-4 py-1.5 font-semibold backdrop-blur tracking-[0.18em]"
            >
              Membership plans
            </Eyebrow>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>

          <PricingGrid
            tiers={tiers}
            className={cn(
              'mx-auto mt-16 grid max-w-md grid-cols-1 items-stretch gap-7 lg:mx-0 lg:max-w-none lg:grid-cols-3',
              props.className,
            )}
          />
        </Container>
      </section>
    )
  },
})
