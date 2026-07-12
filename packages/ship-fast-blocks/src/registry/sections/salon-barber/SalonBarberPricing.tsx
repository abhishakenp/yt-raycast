import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

export const SalonBarberPricing = defineCapsule({
  name: 'SalonBarberPricing',
  description:
    "Barbershop / salon pricing section built on the shared PricingGrid composite. Renders three confident, grooming-focused service tiers — a straight cut, a full grooming service, and a premium works package — each with a clear per-visit price, a feature list, and a Book Now CTA, with the middle tier highlighted as most popular. Use it as the menu / packages band on any barbershop, salon, or men's grooming homepage where visitors choose a service before booking.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const tiers = props.tiers?.length
      ? props.tiers
      : [
          {
            name: 'The Cut',
            price: '$35',
            period: 'per visit',
            features: [
              'Consultation',
              'Precision cut or fade',
              'Hot towel finish',
              'Style & product',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
          },
          {
            name: 'The Full Service',
            price: '$65',
            period: 'per visit',
            features: [
              'Everything in The Cut',
              'Beard trim & line-up',
              'Straight razor shave',
              'Scalp massage',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
            highlighted: true,
          },
          {
            name: 'The Works',
            price: '$95',
            period: 'per visit',
            features: [
              'Everything in Full Service',
              'Color or highlights',
              'Conditioning treatment',
              'Priority booking',
            ],
            cta: 'Book Now',
            ctaTarget: 'Book',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <PricingGrid
            heading={props.heading ?? 'Pricing'}
            subheading={props.subheading ?? 'Simple, honest pricing'}
            tiers={tiers}
          />
        </Container>
      </section>
    )
  },
})
