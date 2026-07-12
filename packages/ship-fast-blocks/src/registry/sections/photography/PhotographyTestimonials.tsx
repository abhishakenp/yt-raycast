import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * PhotographyTestimonials — client-review wall for a fine-art / wedding
 * photographer site. Thin configuration over the shared `TestimonialGrid`
 * composite: a centered serif heading above a responsive card grid where each
 * card renders a star row from the rating, the quoted testimonial, and a couple
 * / client name paired with their event (wedding, elopement, portrait). The
 * public `reviews` prop ({quote, name, rating, event}) maps to the composite's
 * items, with `event` shown as the card meta line via `company`. Use for social
 * proof on photographers, studios, and elopement shooters. Renders fully with
 * no props via baked-in defaults.
 */
export const PhotographyTestimonials = defineCapsule({
  name: 'PhotographyTestimonials',
  description:
    'Client-review wall for a fine-art / wedding photographer site built on the shared TestimonialGrid composite: a centered serif heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the couple / client name with their event (wedding, elopement, portrait). Use for social proof on photographers, studios, and elopement shooters.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Client reviews: quote, name, rating, event. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          event: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by the couples we work with'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Elena felt like a friend from the first call. She captured the quiet, in-between moments we didn't even notice — our gallery still makes us cry happy tears.",
            name: 'Sofia & James',
            rating: 5,
            event: 'Tuscany Wedding',
          },
          {
            quote:
              'We eloped in the mountains and trusted her completely. The photos are raw, emotional, and exactly us. Worth every single mile of travel.',
            name: 'Maya & Theo',
            rating: 5,
            event: 'Dolomites Elopement',
          },
          {
            quote:
              "Our family portraits are the most natural we've ever had. The kids actually had fun, and the editing is timeless — no trendy filters, just us.",
            name: 'The Bennett Family',
            rating: 5,
            event: 'Portrait Session',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.event,
    }))

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <TestimonialGrid heading={heading} items={items} />
        </Container>
      </section>
    )
  },
})
