import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AnalyticsStats — proof-point statistics band for an analytics product,
 * wrapping the shared StatGrid composite in a padded section with an optional
 * centered SectionHeading. Surfaces headline numbers — events tracked,
 * customers, and uptime — as bold value-over-label cells in a responsive grid.
 * Sharp and data-forward. Use to back marketing claims with concrete scale and
 * reliability figures on any analytics, BI, or data-product site. Renders fully
 * with no props via baked-in defaults.
 */
export const AnalyticsStats = defineCapsule({
  name: 'AnalyticsStats',
  description:
    'Proof-point statistics band for an analytics product, wrapping the shared StatGrid composite in a padded section with an optional centered SectionHeading. Surfaces headline numbers — events tracked, customers, and uptime — as bold value-over-label cells in a responsive grid. Sharp and data-forward. Use to back marketing claims with concrete scale and reliability figures on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Trusted at scale'
    const heading = props.heading ?? 'Numbers teams build on'
    const subheading =
      props.subheading ??
      "The kind of scale and reliability you only notice when it's not there."
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '1.2T+', label: 'Events tracked' },
          { value: '8,000+', label: 'Customers' },
          { value: '99.99%', label: 'Uptime SLA' },
        ]

    return (
      <section className={cn('bg-muted/30 py-20 sm:py-24', props.className)}>
        <Container size="xl" className="px-6">
          {heading ? (
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="mb-14"
            />
          ) : null}
          <StatGrid columns={3}>
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
