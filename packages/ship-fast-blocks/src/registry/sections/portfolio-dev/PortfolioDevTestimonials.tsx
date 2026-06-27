import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * PortfolioDevTestimonials — a 3-up client-review wall for a modern developer
 * portfolio. Thin configuration over the shared `TestimonialGrid` composite: a
 * centered heading and subheading above a responsive card grid where each card
 * renders a filled star row from the rating, the quoted testimonial, and an
 * attribution pairing the client name with their role and company. The public
 * `items` prop maps straight to the composite's items. Theme-token only. Use
 * mid-page on a freelance engineer or studio portfolio for social proof from
 * past clients and teams. Renders fully with no props via baked-in defaults.
 */
export const PortfolioDevTestimonials = defineCapsule({
  name: 'PortfolioDevTestimonials',
  description:
    '3-up client-review wall for a modern developer portfolio: a centered heading and subheading above a responsive card grid. Each card renders a filled star row matching the rating, a quoted testimonial, and an attribution row pairing the client name with their role and company. Theme-token only. Use mid-page on a freelance engineer or studio portfolio for social proof from past clients and teams.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Client testimonials: quote, name, role, company, rating. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Testimonials'
    const subheading = props.subheading ?? 'What clients say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Alex shipped our MVP weeks ahead of schedule and the code was the cleanest our team has reviewed. We hired again immediately.',
            name: 'Dana Mitchell',
            role: 'CTO',
            company: 'Northwind',
            rating: 5,
          },
          {
            quote:
              'Rare to find an engineer who owns both the frontend polish and the backend reliability. Our API latency dropped by half.',
            name: 'Sam Okafor',
            role: 'Engineering Lead',
            company: 'Brightpath',
            rating: 5,
          },
          {
            quote:
              'Clear communicator, pragmatic decisions, and zero hand-holding required. Exactly what a fast-moving startup needs.',
            name: 'Priya Shah',
            role: 'Founder',
            company: 'Loopwork',
            rating: 5,
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={subheading}
        items={items}
        className={props.className}
      />
    )
  },
})
