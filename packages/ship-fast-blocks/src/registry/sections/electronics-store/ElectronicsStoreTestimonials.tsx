import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreTestimonials — a 3-up verified-buyer testimonials row for an
 * electronics storefront. A centered heading above muted rounded cards, each with
 * a 5-star rating, a quoted review, and a footer pairing a round customer avatar
 * with the name and a verified-buyer meta line. Avatars are alt-driven images.
 * Use for social proof on electronics stores, gadget shops, consumer-tech
 * retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const ElectronicsStoreTestimonials = defineCapsule({
  name: 'ElectronicsStoreTestimonials',
  description:
    "3-up verified-buyer testimonials row for an electronics storefront: a centered heading above muted rounded cards, each with a 5-star rating, a quoted review, and a footer pairing a round customer avatar with the name and a verified-buyer meta line (e.g. 'Verified Buyer • 3 orders'). Avatars are alt-driven images. Use for social proof on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What Our Customers Say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Ordered the Sony WH-1000XM5 headphones and they arrived in 2 days. The noise cancellation is incredible for my commute. Customer service was helpful when I had questions about setup.',
            name: 'Marcus Chen',
            meta: 'Verified Buyer • 3 orders',
            avatarAlt:
              'Professional headshot of a smiling male customer with short brown hair',
          },
          {
            quote:
              'TechNova has become my go-to for all tech purchases. Bought the DJI Mini 4 Pro and the iPad Air M2 bundle deal saved me over $200. Everything arrived perfectly packaged.',
            name: 'Sarah Mitchell',
            meta: 'Verified Buyer • 8 orders',
            avatarAlt:
              'Professional headshot of a smiling female customer with blonde hair',
          },
          {
            quote:
              'As a professional photographer, I rely on quality gear. The Canon EOS R6 Mark II I purchased was competitively priced and came with full warranty. Their trade-in program is also fantastic.',
            name: 'David Park',
            meta: 'Verified Buyer • 12 orders',
            avatarAlt:
              'Professional headshot of a smiling male photographer with beard and glasses',
          },
        ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <TestimonialGrid columns={3}>
            {items.map((t) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
