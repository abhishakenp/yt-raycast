import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * PropertyListingTestimonials — user-review wall for a property portal. A
 * centered header sits above a responsive 1/2/3-column grid of review cards;
 * each card shows a token-toned star rating row, the quote, and an attribution
 * with an initial avatar chip. Defaults cover three renter/buyer stories. Use
 * to build trust on a property marketplace or search portal. Renders fully with
 * no props via baked-in defaults.
 */
export const PropertyListingTestimonials = defineComponent({
  name: 'PropertyListingTestimonials',
  description:
    'User-review wall for a property portal: a centered header above a responsive 1/2/3-column grid of review cards, each with a token-toned star rating row, a quote, and an attribution with an initial avatar chip. Defaults cover three renter/buyer stories. Use to build trust on a property marketplace or search portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Review cards (rating is 1–5). */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'People find their place here'
    const description =
      props.description ??
      "Thousands of renters and buyers start their search with us every day. Here's why they stay."
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I filtered to pet-friendly under budget and had three tours booked the same afternoon. Signed a lease that week.',
            name: 'Alyssa Tran',
            rating: 5,
          },
          {
            quote:
              'The saved-search alerts are unreal — I got the listing within an hour of it going live and beat everyone to it.',
            name: 'Devon Carter',
            rating: 5,
          },
          {
            quote:
              "Map search showed me commute times I'd never have checked myself. Found a place ten minutes from work.",
            name: 'Mei Lin',
            rating: 4,
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={description}
        items={reviews.map((review) => ({
          quote: review.quote,
          name: review.name,
          rating: review.rating,
        }))}
        columns={3}
        className={props.className}
      />
    )
  },
})
