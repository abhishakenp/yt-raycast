import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * PlumbingHvacStats — a by-the-numbers proof band for a plumbing & HVAC trade
 * site. A centered SectionHeading (eyebrow + title + subtitle) above the shared
 * `StatGrid` composite: a responsive four-column grid of big bold values over
 * muted labels. Defaults highlight credibility metrics that homeowners care
 * about — years in business, jobs completed, certified techs, and average
 * rating. Use as a trust band between content sections on plumber, HVAC, or
 * other home-service sites. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacStats = defineCapsule({
  name: 'PlumbingHvacStats',
  description:
    'A by-the-numbers proof band for a plumbing & HVAC trade site: a centered SectionHeading (eyebrow + title + subtitle) above the shared StatGrid composite — a responsive four-column grid of big bold values over muted labels. Defaults highlight credibility metrics homeowners care about — years in business, jobs completed, certified techs, and average rating. Use as a trust band between content sections on plumber, HVAC, or other home-service sites.',
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    heading: z.string().optional(),
    /** Supporting subtitle under the title. */
    subheading: z.string().optional(),
    /** Stat items (value + label). */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Grid column count (2/3/4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Why homeowners trust us'
    const heading = props.heading ?? 'Two decades of dependable service'
    const subheading =
      props.subheading ??
      'Locally owned, licensed, and insured — the numbers our neighbors have come to count on.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '20+', label: 'Years in Business' },
          { value: '18,000+', label: 'Jobs Completed' },
          { value: '25', label: 'Certified Technicians' },
          { value: '4.9★', label: 'Average Rating' },
        ]

    return (
      <section className="bg-background pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container size="xl" className="px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="mb-14"
          />
          <StatGrid columns={props.columns ?? 4} className={props.className}>
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label}>
                  <StatValue>{__iv__.value}</StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
