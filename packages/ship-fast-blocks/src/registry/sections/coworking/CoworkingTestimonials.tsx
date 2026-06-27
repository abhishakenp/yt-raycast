import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * CoworkingTestimonials — 3-up member-review wall for a coworking or shared-
 * workspace page. Thin configuration over the shared `TestimonialGrid`
 * composite: a centered heading above a responsive card grid where each card
 * renders a star row, a quoted member testimonial, and an attribution pairing
 * the member's name with their role and company. The public `members` prop
 * ({quote, name, role, company, rating}) maps to the composite's items. Use for
 * social proof on coworking spaces, shared offices, or flex-office providers.
 * Renders fully with no props via bright, modern baked-in defaults.
 */
export const CoworkingTestimonials = defineCapsule({
  name: 'CoworkingTestimonials',
  description:
    "3-up member-review wall for a coworking or shared-workspace page built on the shared TestimonialGrid composite: a centered heading above a responsive card grid. Each card renders a filled star row, a quoted member testimonial, and an attribution row pairing the member's name with their role and company. Use for social proof on coworking spaces, shared offices, or flex-office providers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Member reviews: quote, name, optional role, company, and rating. */
    members: z
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
    const members = props.members?.length
      ? props.members
      : [
          {
            quote:
              "Moving my startup here was the easiest decision of the year. The WiFi never blinks, the meeting rooms are always free when I need them, and I've already hired two people I met at a member lunch.",
            name: 'Maya Chen',
            role: 'Founder',
            company: 'Loop Analytics',
            rating: 5,
          },
          {
            quote:
              'As a freelancer I was tired of cafés. A dedicated desk here gives me a real workspace, great coffee, and a community to bounce ideas off. My productivity has genuinely doubled.',
            name: 'Devon Park',
            role: 'Product Designer',
            company: 'Independent',
            rating: 5,
          },
          {
            quote:
              "We took a private office for our remote team's hub and it's perfect. 24/7 access fits our timezone spread, and the staff treat us like family. Couldn't recommend it more.",
            name: 'Aisha Rahman',
            role: 'Operations Lead',
            company: 'Northwind Labs',
            rating: 5,
          },
        ]

    const items = members.map((m) => ({
      quote: m.quote,
      name: m.name,
      role: m.role,
      company: m.company,
      rating: m.rating ?? 5,
    }))

    return (
      <TestimonialGrid
        heading={props.heading ?? 'Loved by our members'}
        subheading={
          props.subheading ??
          'Founders, freelancers, and remote teams who made Northside their home base.'
        }
        items={items}
        className={props.className}
      />
    )
  },
})
