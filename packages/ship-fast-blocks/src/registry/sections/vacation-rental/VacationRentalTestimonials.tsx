import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * VacationRentalTestimonials — a guest-reviews grid for a vacation-rental listing
 * page. Thin configuration over the shared `TestimonialGrid` composite: a "Loved
 * by guests" heading above a responsive grid of review cards, each with a star
 * rating, a quote, a guest name, and a "Verified guest" meta line. Theme-token
 * only. Use to surface social proof on a vacation rental, beach house, cabin,
 * villa, or boutique short-stay page. Renders fully with no props via baked-in
 * defaults.
 */
export const VacationRentalTestimonials = defineComponent({
  name: 'VacationRentalTestimonials',
  description:
    'Guest-reviews grid for a vacation-rental listing page built on the shared TestimonialGrid composite: a Loved by guests heading above a responsive grid of review cards, each with a star rating, a quote, a guest name, and a Verified guest meta line. Theme-token only. Use to surface social proof on a vacation rental, beach house, cabin, villa, or boutique short-stay page.',
  props: z.object({
    /** Section heading above the reviews grid. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Review cards: quote, name, rating, and optional role/company meta. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    /** Column count for the responsive grid. */
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The most relaxing week we've had in years. Waking up to the sound of the waves and that view from the deck — we never wanted to leave.",
            name: 'Maya & Daniel R.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a smiling couple on vacation',
          },
          {
            quote:
              "Spotless, stylish, and even better than the photos. The kitchen was a dream and the host's local recommendations made the trip.",
            name: 'Priya N.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a happy woman traveler',
          },
          {
            quote:
              "Brought the whole family, dog included. The pool was perfect for the kids and check-in could not have been easier. We're already planning our return.",
            name: 'Tom & Greta L.',
            role: 'Verified guest',
            rating: 5,
            avatarAlt: 'Portrait of a cheerful family on holiday',
          },
        ]

    return (
      <TestimonialGrid
        heading={props.heading ?? 'Loved by guests'}
        subheading={
          props.subheading ??
          "Hundreds of five-star stays — here's what recent guests had to say."
        }
        items={items}
        columns={props.columns ?? 3}
        className={props.className}
      />
    )
  },
})
