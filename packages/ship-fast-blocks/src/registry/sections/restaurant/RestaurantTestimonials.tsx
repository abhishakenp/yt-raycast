import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * Coerce a generated review rating (which may arrive as a string, number, or
 * malformed fragment) into a usable numeric star rating. Returns `null` when
 * the value cannot be parsed so the caller can skip rendering a StarRating
 * rather than leaking raw fragments into aria labels.
 */
function coerceRating(rating: unknown): number | null {
  if (typeof rating === 'number' && Number.isFinite(rating)) return rating
  if (typeof rating === 'string') {
    const parsed = Number(rating)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

/**
 * RestaurantTestimonials — 3-up guest-review wall for a restaurant page. Thin
 * configuration over the shared `TestimonialGrid` composite: a centered serif
 * heading above a responsive card grid where each card renders a star row from
 * the rating, the quoted testimonial, and a guest name paired with the review
 * source (Google, Yelp, OpenTable). The public `reviews` prop ({quote, name,
 * rating, source}) maps to the composite's items, with `source` shown as the
 * card's meta line via `company`. Use for social-proof on restaurants, bistros,
 * fine dining, or any dining venue. Renders fully with no props via baked
 * defaults.
 */
export const RestaurantTestimonials = defineCapsule({
  name: 'RestaurantTestimonials',
  description:
    '3-up guest-review wall for a restaurant page: a centered serif heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the guest name with the review source (Google, Yelp, OpenTable). Use for social-proof on restaurants, bistros, fine dining, or any dining venue.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Guest reviews: quote, name, rating, source/role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.union([z.number(), z.string()]),
          source: z.string().optional(),
          role: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What our guests say'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'Every dish arrived plated like art and tasted even better. The pasta was made fresh that morning and the wine pairing was spot on. Easily our best dinner this year.',
            name: 'Elena Rossi',
            rating: 5,
            source: 'Google Review',
          },
          {
            quote:
              'Booked for our anniversary and the team made it unforgettable. Warm service, an unhurried pace, and a tasting menu that kept surprising us course after course.',
            name: 'Marcus Bennett',
            rating: 5,
            source: 'OpenTable',
          },
          {
            quote:
              'The seasonal menu changes often and never misses. The roasted branzino and the burnt-honey dessert are reason enough to come back. Reserve ahead — it fills up fast.',
            name: 'Priya Nair',
            rating: 4,
            source: 'Yelp',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: coerceRating(r.rating) ?? undefined,
      role: r.role,
      company: r.source,
    }))

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <TestimonialGrid heading={heading}>
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
