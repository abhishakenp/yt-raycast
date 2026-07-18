import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'

/**
 * FlightSimulatorStats — a 4-up headline-metrics band for a flight simulator
 * landing page. Wraps the shared `StatGrid` composite in a token section with an
 * optional `SectionHeading`, rendering four bold value/label pairs (aircraft,
 * airports, active pilots, scenery area) that quantify the scale of the world.
 * Use as a credibility band beneath the hero or features of a flight sim,
 * airliner / combat sim, or aviation title. Renders fully with no props via
 * baked defaults.
 */
export const FlightSimulatorStats = defineCapsule({
  name: 'FlightSimulatorStats',
  description:
    '4-up headline-metrics band for a flight-simulator landing page: wraps the shared StatGrid composite in a token section with an optional SectionHeading, rendering four bold value/label pairs (aircraft, airports, active pilots, scenery area) that quantify the scale of the simulated world. Use as a credibility band beneath the hero or features of a flight sim, airliner / combat sim, or aviation title.',
  props: z.object({
    /** Optional section heading shown above the stat grid. */
    heading: z.string().optional(),
    /** Optional subheading under the heading. */
    subheading: z.string().optional(),
    /** Stats: bold value + muted label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '200+', label: 'Aircraft' },
          { value: '37,000', label: 'Airports' },
          { value: '1.2M', label: 'Active Pilots' },
          { value: '197M sq mi', label: 'Scenery' },
        ]

    return (
      <section
        className={cn(
          'flex flex-col gap-10 bg-muted px-6 py-16 lg:px-8',
          props.className,
        )}
      >
        {props.heading ? (
          <SectionHeading title={props.heading} subtitle={props.subheading} />
        ) : null}
        <div className="mx-auto w-full max-w-5xl">
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
      </section>
    )
  },
})
