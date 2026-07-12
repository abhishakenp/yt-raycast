import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * VideoStreamingTestimonials — a 3-up subscriber-review wall for a
 * video-streaming page. Thin configuration over the shared `TestimonialGrid`
 * composite: a centered heading above a responsive card grid where each card
 * renders a star row from the rating, the quoted review, and a subscriber name
 * paired with the review source (App Store, Trustpilot, Google Play). The
 * public `reviews` prop ({quote, name, rating, source}) maps to the composite's
 * items, with `source` shown as the card's meta line via `company`. Use for
 * social proof on streaming services or OTT apps. Renders fully with no props.
 */
export const VideoStreamingTestimonials = defineCapsule({
  name: 'VideoStreamingTestimonials',
  description:
    'A 3-up subscriber-review wall for a video-streaming page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted review, and an attribution row pairing the subscriber name with the review source (App Store, Trustpilot, Google Play). Use for social proof on streaming services, OTT apps, or on-demand video platforms.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Subscriber reviews: quote, name, rating, source. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          source: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by millions'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              "Cancelled three other services after switching. The 4K looks unreal on my TV, downloads actually work on flights, and I've never once seen an ad. This is the only subscription I'd fight to keep.",
            name: 'Daniel Okafor',
            rating: 5,
            source: 'App Store',
          },
          {
            quote:
              'The originals alone are worth it, but what sold me is how it just works — same spot on my phone, laptop, and living room TV. Five profiles means the whole house finally stopped fighting over one account.',
            name: 'Sofia Almeida',
            rating: 5,
            source: 'Trustpilot',
          },
          {
            quote:
              'Streams instantly, never buffers, and the recommendations actually nail what I want to watch next. Standard plan is the sweet spot for our family — easily the best value in streaming right now.',
            name: 'Hannah Wei',
            rating: 4,
            source: 'Google Play',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      company: r.source,
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
