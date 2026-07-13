import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * SpaWellnessTestimonials — guest-review band for a day-spa / wellness page.
 * Thin configuration over the shared `TestimonialGrid` composite: a centered
 * heading above a responsive grid of review cards, each with a star rating, a
 * guest quote, and the guest's name. Use to build trust with social proof from
 * spa guests, members, and first-time visitors. Renders fully with no props via
 * baked-in defaults.
 */
export const SpaWellnessTestimonials = defineCapsule({
  name: 'SpaWellnessTestimonials',
  description:
    "Guest-review band for a day-spa / wellness page built on the shared TestimonialGrid composite: a centered heading above a responsive grid of review cards, each with a star rating, a guest quote, and the guest's name. Use to build trust with social proof from spa guests, members, and first-time visitors.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Guest reviews; rating is 1–5 stars. */
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
    const heading = props.heading ?? 'Guests leave glowing'
    const subheading =
      props.subheading ??
      'Real words from the people who trust us with their moments of rest.'
    const reviews = props.reviews?.length
      ? props.reviews
      : [
          {
            quote:
              'I walked in carrying a week of stress and floated out feeling brand new. The hot stone ritual is pure magic.',
            name: 'Maya R.',
            rating: 5,
          },
          {
            quote:
              'The most serene hour of my month. Every detail, from the tea to the lighting, is thoughtfully done.',
            name: 'Daniel K.',
            rating: 5,
          },
          {
            quote:
              'My skin has never looked better since starting the monthly facial. The therapists genuinely care.',
            name: 'Priya S.',
            rating: 5,
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
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={reviews.map((r) => ({
              quote: r.quote,
              name: r.name,
              rating: r.rating,
            }))}
          />
        </Container>
      </section>
    )
  },
})
