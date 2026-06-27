import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * NewsTestimonials — 3-up reader-review wall for a news / editorial site. Thin
 * configuration over the shared `TestimonialGrid` composite (3 columns): a
 * centered heading + subheading above a responsive card grid where each card
 * renders a star row, the reader's quote, and an avatar + name + role footer.
 * The public `items` prop ({quote, name, role, avatarAlt}) maps to the
 * composite's items. Use to build trust on a newspaper, magazine or
 * subscription publication homepage, typically before the subscribe CTA.
 * Renders fully with no props via baked-in defaults.
 */
export const NewsTestimonials = defineCapsule({
  name: 'NewsTestimonials',
  description:
    "3-up reader-review wall for a news / editorial site built on the shared TestimonialGrid composite: a centered heading + subheading above a responsive 3-column card grid where each card renders a star row, the reader's quote, and an avatar + name + role footer. Use to build trust on a newspaper, magazine or subscription publication homepage, typically before the subscribe CTA.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
    /** Reader testimonials: quote, name, role, avatarAlt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What Readers Say'
    const subheading =
      props.subheading ?? 'Trusted by over 2 million subscribers worldwide'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The Chronicle's investigative reporting on climate policy helped me understand complex legislation better than any other source. Their journalists actually read the bills.",
            name: 'Prof. Robert Chen',
            role: 'Environmental Policy, Stanford',
            avatarAlt:
              'Professional headshot of Professor Robert Chen with glasses',
          },
          {
            quote:
              "I started my day with The Chronicle's briefing three years ago and haven't stopped. It's the perfect balance of depth and brevity for a busy executive.",
            name: 'Jennifer Walsh',
            role: 'CEO, Horizon Ventures',
            avatarAlt:
              'Professional headshot of Jennifer Walsh CEO in business attire',
          },
          {
            quote:
              "Finally, a news source that doesn't treat readers like attention-deficient children. Long-form journalism done right. Worth every penny of the subscription.",
            name: 'David Park',
            role: 'Software Architect, Seattle',
            avatarAlt: 'Professional headshot of David Park software engineer',
          },
        ]

    return (
      <TestimonialGrid
        heading={heading}
        subheading={subheading}
        columns={3}
        items={items.map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          avatarAlt: t.avatarAlt,
        }))}
        className={props.className}
      />
    )
  },
})
