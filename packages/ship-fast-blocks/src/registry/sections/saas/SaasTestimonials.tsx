import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * SaasTestimonials — a social-proof band for a B2B SaaS landing page. Thin
 * configuration over the shared `TestimonialGrid` composite: a centered heading
 * + optional intro above a responsive grid of quote cards, each showing a
 * customer quote and an avatar footer with the person's name, role, and
 * company. Use to build trust with real customer voices on SaaS, app, or
 * service landing pages. Renders fully with no props via baked-in defaults.
 */
export const SaasTestimonials = defineComponent({
  name: 'SaasTestimonials',
  description:
    "A social-proof band for a B2B SaaS landing page built on the shared TestimonialGrid composite: a centered heading + optional intro above a responsive grid of quote cards, each showing a customer quote and an avatar footer with the person's name, role, and company. Use to build trust with real customer voices on SaaS, app, or service landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Testimonial cards; each renders a quote, avatar, name, role, company. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          company: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by modern teams'
    const subheading =
      props.subheading ??
      'Thousands of companies rely on us every day to move faster and ship with confidence.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We replaced three tools with this and cut our onboarding time in half. The team adopted it in a single afternoon.',
            name: 'Sarah Chen',
            role: 'VP of Operations',
            company: 'Northwind',
          },
          {
            quote:
              'The automation just works. Workflows that used to take an engineer a week now ship in an hour with zero code.',
            name: 'Marcus Reid',
            role: 'Head of Engineering',
            company: 'Lumen Labs',
          },
          {
            quote:
              "Support is genuinely world-class, and the product keeps getting better. It's become core to how we operate.",
            name: 'Priya Nair',
            role: 'Product Lead',
            company: 'Cadence',
          },
          {
            quote:
              'Rolled out across 200 people without a single ticket. The analytics alone paid for the entire subscription.',
            name: 'David Okafor',
            role: 'Director of IT',
            company: 'Brightway',
          },
          {
            quote:
              'Setup took minutes, not months. We saw measurable revenue impact within the first quarter of using it.',
            name: 'Elena Vasquez',
            role: 'Growth Manager',
            company: 'Pulse',
          },
          {
            quote:
              "Reliable, fast, and beautifully designed. It's rare to find a tool both our developers and execs actually enjoy.",
            name: 'Tom Becker',
            role: 'CTO',
            company: 'Vertex',
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
