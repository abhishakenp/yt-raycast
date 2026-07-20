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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'

/** Decorative div-built instrument dial: token ring, tick marks, primary needle. */
function GaugeDial({ angle, index }: { angle: number; index: number }) {
  const ticks = Array.from({ length: 12 }, (_, t) => t * 30)
  return (
    <div aria-hidden="true" className="relative size-24 shrink-0 sm:size-28">
      <div className="absolute inset-0 rounded-full border-2 border-border" />
      <div className="absolute inset-2.5 rounded-full border border-border/60" />
      {ticks.map((deg) => (
        <span
          key={deg}
          className="absolute inset-0"
          style={{ transform: `rotate(${deg}deg)` }}
        >
          <span className="absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 rounded-full bg-muted-foreground/40" />
        </span>
      ))}
      <span
        className="absolute inset-0"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span className="absolute left-1/2 top-[14%] h-[36%] w-1 -translate-x-1/2 rounded-full bg-primary" />
      </span>
      <span className="absolute left-1/2 top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card">
        <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>
    </div>
  )
}

/**
 * FlightSimulatorStats — an instrument-cluster metrics band for a flight
 * simulator landing page. A muted panel with a slanted top seam, a mono
 * `[ INSTRUMENTS ] LIVE READOUT` HUD rule and a giant ghost "KTS" watermark,
 * wrapping the shared `StatGrid` composite: four cells each pairing a div-built
 * circular gauge dial (token ring, tick marks, primary needle, numbered hub)
 * with a giant tabular value and a mono uppercase label (aircraft, airports,
 * active pilots, scenery area). An optional `SectionHeading` sits above. Use as a
 * credibility band beneath the hero or features of a flight sim, airliner /
 * combat sim, or aviation title. Renders fully with no props via baked defaults.
 */
export const FlightSimulatorStats = defineCapsule({
  name: 'FlightSimulatorStats',
  description:
    'Instrument-cluster metrics band for a flight-simulator landing page: a muted panel with a slanted top seam, a mono HUD rule and a giant ghost "KTS" watermark, wrapping the shared StatGrid composite as four cells that each pair a div-built circular gauge dial (token ring, tick marks, primary needle, numbered hub) with a giant tabular value and a mono uppercase label (aircraft, airports, active pilots, scenery area). An optional SectionHeading sits above. Use as a credibility band beneath the hero or features of a flight sim, airliner / combat sim, or aviation title.',
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

    const angles = [-52, 18, 68, -14]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/50 px-6 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:px-8 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-4 bottom-2 text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          KTS
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              [ Instruments ] live readout
            </MonoTag>
            <MonoTag tone="faint" className="tabular-nums">
              {String(stats.length).padStart(2, '0')} /{' '}
              {String(stats.length).padStart(2, '0')}
            </MonoTag>
          </div>
          {props.heading ? (
            <SectionHeading
              align="left"
              title={props.heading}
              subtitle={props.subheading}
              className="mb-10 max-w-2xl"
            />
          ) : null}
          <StatGrid columns={4} className="gap-x-6 gap-y-12">
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="center"
                  className="items-center gap-4"
                >
                  <GaugeDial angle={angles[i % angles.length]} index={i} />
                  <StatValue className="mb-0 text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
