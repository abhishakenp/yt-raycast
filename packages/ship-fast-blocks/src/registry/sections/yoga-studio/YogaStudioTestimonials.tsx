import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * YogaStudioTestimonials — member-review band for a yoga-studio page. Thin
 * configuration over the shared `TestimonialGrid` composite: a centered heading
 * above a responsive grid of review cards, each with a star rating, a member
 * quote, and the member's name. Use to build trust with social proof from studio
 * members, drop-in students, and newcomers. Renders fully with no props via
 * baked-in defaults.
 */
export const YogaStudioTestimonials = defineCapsule({
  name: 'YogaStudioTestimonials',
  description:
    "Member-review band for a yoga-studio page built on the shared TestimonialGrid composite: a centered heading above a responsive grid of review cards, each with a star rating, a member quote, and the member's name. Use to build trust with social proof from studio members, drop-in students, and newcomers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Member reviews; rating is 1–5 stars. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by our community'
    const subheading =
      props.subheading ??
      'Hear from the members who make this studio feel like home.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I came in nervous as a total beginner and left feeling strong and welcome. The teachers truly meet you where you are.',
            name: 'Jordan M.',
            rating: 5,
          },
          {
            quote:
              'The schedule fits my life and the community is so warm. This has become the best part of my week.',
            name: 'Sofia L.',
            rating: 5,
          },
          {
            quote:
              'Hot Power kicked my butt in the best way. Six months in and I feel more grounded than ever.',
            name: 'Marcus T.',
            rating: 5,
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={subheading}
        items={reviews.map((r) => ({
          quote: r.quote,
          name: r.name,
          rating: r.rating,
        }))}
        className={props.className}
      />
    )
  },
})
