import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * NonprofitStats — impact-by-the-numbers band for a nonprofit / charity / NGO
 * page. A centered `SectionHeading` (eyebrow + title + subtitle) sits above the
 * shared `StatGrid` composite, which lays out four headline metrics — people
 * helped, funds raised, volunteers, and years of service — as bold values over
 * muted labels. Use to prove credibility and momentum on nonprofit, foundation,
 * or humanitarian pages. Renders fully with no props via baked-in "Roots of
 * Hope" defaults.
 */
export const NonprofitStats = defineComponent({
  name: 'NonprofitStats',
  description:
    'Impact-by-the-numbers band for a nonprofit / charity / NGO page: a centered SectionHeading (eyebrow + title + subtitle) above the shared StatGrid composite laying out four headline metrics — people helped, funds raised, volunteers, and years of service — as bold values over muted labels. Use to prove credibility and momentum on nonprofit, foundation, or humanitarian pages.',
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    heading: z.string().optional(),
    /** Supporting line under the title. */
    subheading: z.string().optional(),
    /** Headline metrics: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our impact'
    const heading = props.heading ?? 'Hope, measured in lives changed'
    const subheading =
      props.subheading ??
      "Together with our donors and volunteers, we've turned generosity into real, lasting change for communities around the world."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2.4M', label: 'People helped' },
          { value: '$48M', label: 'Funds raised' },
          { value: '12K', label: 'Volunteers' },
          { value: '18', label: 'Years of service' },
        ]

    return (
      <section className="py-20 lg:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <StatGrid stats={stats} columns={4} className={props.className} />
        </div>
      </section>
    )
  },
})
