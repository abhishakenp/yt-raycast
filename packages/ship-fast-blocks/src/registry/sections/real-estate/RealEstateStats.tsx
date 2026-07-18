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
 * RealEstateStats — a confident track-record band for a brokerage. An optional
 * centered serif header sits above a responsive 2/4-column row of KPI cells;
 * each cell shows a large primary-toned figure over a muted label. Defaults
 * cover homes sold, sales volume, average days on market, and happy clients.
 * Use to prove credibility on a real-estate brokerage or agent site. Renders
 * fully with no props via baked-in defaults.
 */
export const RealEstateStats = defineCapsule({
  name: 'RealEstateStats',
  description:
    'Confident track-record band for a brokerage: an optional centered serif header above a responsive 2/4-column row of KPI cells, each showing a large primary-toned figure over a muted label. Defaults cover homes sold, sales volume, average days on market, and happy clients. Use to prove credibility on a real-estate brokerage or agent site.',
  props: z.object({
    /** Optional section heading (serif). */
    heading: z.string().optional(),
    /** Optional supporting line under the heading. */
    description: z.string().optional(),
    /** KPI cells. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'A track record you can trust'
    const description =
      props.description ??
      'Numbers that come from showing up for our clients, deal after deal, year after year.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '3,200+', label: 'Homes sold' },
          { value: '$2.4B', label: 'In sales volume' },
          { value: '21', label: 'Avg. days on market' },
          { value: '98%', label: 'Happy clients' },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          {heading || description ? (
            <SectionHeading title={heading} subtitle={description} />
          ) : null}
          <div className="mt-12">
            <StatGrid columns={4}>
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
          </div>
        </Container>
      </section>
    )
  },
})
