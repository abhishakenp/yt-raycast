import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * AnalyticsTestimonials — social-proof testimonial band for an analytics
 * product, composing the shared TestimonialGrid composite inside a padded
 * section with an optional centered SectionHeading. Renders three star-rated
 * quote cards from data and growth leaders with name, role, and company. Sharp
 * and data-forward. Use to build trust before the pricing or final CTA on any
 * analytics, BI, or data-product site. Renders fully with no props.
 */
export const AnalyticsTestimonials = defineComponent({
  name: 'AnalyticsTestimonials',
  description:
    'Social-proof testimonial band for an analytics product, composing the shared TestimonialGrid composite inside a padded section with an optional centered SectionHeading. Renders three star-rated quote cards from data and growth leaders with name, role, and company. Sharp and data-forward. Use to build trust before the pricing or final CTA on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Loved by data teams'
    const heading = props.heading ?? "The last analytics tool you'll set up"
    const subheading =
      props.subheading ??
      "Teams switch to Pulse and stop fighting their data. Here's what changed for them."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We cut our reporting time from days to minutes. Pulse is the first tool every new hire actually opens on day one.',
            name: 'Maya Okonkwo',
            role: 'VP of Growth',
            company: 'Northwind',
            rating: 5,
          },
          {
            quote:
              'Query latency that used to be 30 seconds is now instant. Our analysts finally trust the dashboards again.',
            name: 'Daniel Reyes',
            role: 'Head of Data',
            company: 'Vertex',
            rating: 5,
          },
          {
            quote:
              'Smart alerts caught a checkout regression before our on-call did. That alone paid for the whole year.',
            name: 'Priya Nair',
            role: 'Director of Product',
            company: 'Lumen',
            rating: 5,
          },
        ]

    return (
      <section className={cn('bg-muted/30 py-20 sm:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="mb-14"
          />
          <TestimonialGrid items={items} columns={3} />
        </div>
      </section>
    )
  },
})
