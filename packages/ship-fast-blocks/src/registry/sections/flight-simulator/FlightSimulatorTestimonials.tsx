import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * FlightSimulatorTestimonials — a 3-up review wall for a flight simulator
 * landing page. Thin configuration over the shared `TestimonialGrid` composite:
 * a centered heading above a responsive card grid where each card renders a star
 * row from the rating, the quoted review, and a reviewer name paired with their
 * role (real-world pilot, sim YouTuber, flight instructor). The public `reviews`
 * prop ({quote, name, rating, role}) maps to the composite's items, with `role`
 * shown as the card's meta line. Use for social-proof on flight sims, airliner /
 * combat sims, or aviation titles. Renders fully with no props via baked
 * defaults.
 */
export const FlightSimulatorTestimonials = defineCapsule({
  name: 'FlightSimulatorTestimonials',
  description:
    '3-up review wall for a flight-simulator landing page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted review, and an attribution row pairing the reviewer name with their role (real-world pilot, sim YouTuber, flight instructor). Use for social-proof on flight sims, airliner / combat sims, or aviation titles.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Reviews: quote, name, rating, role. */
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          rating: z.number(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by pilots and reviewers'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I fly the A320 for a living, and the way this sim models the flight management system and the way she handles in a crosswind is uncanny. I run my procedures here before every line check.',
            name: 'Captain Dana Mercer',
            rating: 5,
            role: 'Real-world A320 pilot',
          },
          {
            quote:
              "I've covered every major flight sim for years and nothing comes close to this. The scenery streaming, the weather, the sheer scale of the world — it's the most jaw-dropping sim I've ever flown.",
            name: 'Liam Park',
            rating: 5,
            role: 'Sim YouTuber',
          },
          {
            quote:
              'We use it in our ground school to teach navigation and radio work. Students who train here show up to the real cockpit already ahead. The fidelity is genuinely classroom-grade.',
            name: 'Sofia Alvarez',
            rating: 4,
            role: 'Flight school instructor',
          },
        ]

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      rating: r.rating,
      role: r.role,
    }))

    return (
      <TestimonialGrid
        heading={heading}
        items={items}
        className={props.className}
      />
    )
  },
})
