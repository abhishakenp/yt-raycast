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
 * RealEstateStats — dark inverted track-record band for a luxury brokerage. A
 * full ink inversion (bg-foreground / text-background) that cuts in on a slanted
 * clip-path seam, with an asymmetric header (serif heading + lede left, mono
 * "[ track record ]" meta right) over a giant ghost watermark numeral. Below, a
 * collapsed-border grid of KPI cells, each with a giant fluid tabular numeral, a
 * mono uppercase label, and a small primary tick motif. Defaults cover homes
 * sold, sales volume, average days on market, and happy clients. Use to prove
 * credibility on a real-estate brokerage or agent site. Renders fully with no
 * props via baked-in defaults.
 */
export const RealEstateStats = defineCapsule({
  name: 'RealEstateStats',
  description:
    'Dark inverted track-record band for a luxury brokerage: a full ink inversion (bg-foreground / text-background) on a slanted clip-path seam with an asymmetric header (serif heading + lede left, mono track-record meta right) over a giant ghost watermark numeral, above a collapsed-border grid of KPI cells each with a giant fluid tabular numeral, a mono uppercase label, and a small primary tick motif. Defaults cover homes sold, sales volume, average days on market, and happy clients. Use to prove credibility on a real-estate brokerage or agent site.',
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
    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6']

    return (
      <section
        className={cn(
          // Slanted top edge — the inverted band cuts in on a diagonal seam
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-4 select-none font-semibold leading-none tracking-tighter text-background/[0.05] tabular-nums text-[12rem] sm:text-[16rem] lg:text-[20rem]"
        >
          {String(stats[0]?.value ?? '')}
        </span>

        <Container size="xl" className="relative px-6">
          {heading || description ? (
            <div className="mb-12 flex flex-col gap-6 border-b border-background/15 pb-8 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="max-w-2xl gap-3"
                titleClassName="font-serif text-3xl font-medium tracking-tight text-background sm:text-4xl lg:text-5xl"
                subtitleClassName="max-w-lg text-background/60"
              />
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-background/40"
              >
                [ track record ]
              </span>
            </div>
          ) : null}
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {stats.map((s, i) => (
              <StatItem
                key={`${s.label}-${i}`}
                align="left"
                className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
              >
                <StatValue className="mb-0 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none tracking-tight text-background tabular-nums">
                  {s.value}
                </StatValue>
                <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                  {s.label}
                </StatLabel>
                <span
                  aria-hidden="true"
                  className="mt-1 flex items-center gap-1"
                >
                  <span
                    className={cn(
                      'h-1 bg-primary',
                      tickWidths[i % tickWidths.length],
                    )}
                  />
                  <span className="h-1 w-1 bg-background/30" />
                  <span className="h-1 w-1 bg-background/30" />
                </span>
              </StatItem>
            ))}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
