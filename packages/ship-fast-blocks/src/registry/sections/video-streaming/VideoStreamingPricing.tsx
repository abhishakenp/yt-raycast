import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

/**
 * VideoStreamingPricing — a 3-tier plan band for a video-streaming landing
 * page. Thin configuration over the shared `PricingGrid` composite: a centered
 * heading + intro above a responsive 3-column grid of plan cards (name, big
 * monthly price, checkmark feature bullets, and a CTA). The highlighted middle
 * tier (Standard) gets a primary border, shadow, and a floating "Most popular"
 * pill, and every CTA routes through useNavigate. Use to present subscription
 * tiers — Basic, Standard, Premium — for a streaming service. Renders fully
 * with no props via baked-in defaults.
 */
export const VideoStreamingPricing = defineCapsule({
  name: 'VideoStreamingPricing',
  description:
    "A 3-tier plan band for a video-streaming landing page built on the shared PricingGrid composite: a centered heading + intro above a responsive 3-column grid of plan cards (name, big monthly price, checkmark feature bullets, and a CTA). The highlighted middle tier (Standard) gets a primary border, shadow, and a 'Most popular' pill, and every CTA routes through useNavigate. Use to present subscription tiers — Basic, Standard, Premium — for a streaming service or OTT app.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Pricing tiers (supply exactly 3); mark one with highlighted to feature it. */
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Pick your plan'
    const subheading =
      props.subheading ??
      'Every plan includes the full catalog and zero ads. Upgrade for sharper quality and more screens — cancel anytime.'
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'Basic',
            price: '$8',
            period: '/mo',
            features: [
              'Full catalog, zero ads',
              'HD (720p) streaming',
              'Watch on 1 screen',
              'Offline downloads',
            ],
            cta: 'Choose plan',
            highlighted: false,
          },
          {
            name: 'Standard',
            price: '$14',
            period: '/mo',
            features: [
              'Everything in Basic',
              'Full HD (1080p) streaming',
              'Watch on 2 screens at once',
              'Up to 5 profiles',
              'Offline on any device',
            ],
            cta: 'Choose plan',
            highlighted: true,
          },
          {
            name: 'Premium',
            price: '$20',
            period: '/mo',
            features: [
              'Everything in Standard',
              '4K Ultra HD + HDR',
              'Watch on 4 screens at once',
              'Dolby Atmos sound',
              'Early access to originals',
            ],
            cta: 'Choose plan',
            highlighted: false,
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <PricingGrid
            heading={heading}
            subheading={subheading}
            tiers={tiers.map((t) => ({
              name: t.name,
              price: t.price,
              period: t.period,
              features: t.features,
              cta: t.cta,
              ctaTarget: t.cta,
              highlighted: t.highlighted,
            }))}
          />
        </Container>
      </section>
    )
  },
})
