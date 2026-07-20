import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { GraphPaper } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * ArchitectureFirmStats — inverted blueprint survey band for an
 * architecture-studio / design-practice page. A full-width ink band
 * (foreground surface, background text) that cuts in on a slanted top seam,
 * its surface ruled by a faint inverted graph-paper grid: an aria-hidden mono
 * "SITE DATA / SURVEY" annotation rail above a collapsed-border 2/4-column
 * grid of hairline stat cells. Each cell holds a giant ultra-thin fluid
 * tabular numeral over a mono uppercase caption and a small measurement tick
 * motif. Precise, monochrome, high-contrast counterpoint to the light drawing
 * sheets around it. Tokens-only, no links. Use as a metrics /
 * by-the-numbers / track-record band (completed projects, awards, countries,
 * team size) for architecture firms, design studios, interior designers or
 * any practice that wants a quiet proof-of-scale strip. Renders fully with no
 * props via four baked-in stats.
 */
export const ArchitectureFirmStats = defineCapsule({
  name: 'ArchitectureFirmStats',
  description:
    'Inverted blueprint survey band for an architecture-studio / design-practice page: a full-width ink band (foreground surface, background text) cutting in on a slanted top seam over a faint inverted graph-paper grid, with an aria-hidden mono "SITE DATA / SURVEY" annotation rail above a collapsed-border 2/4-column grid of hairline stat cells — each a giant ultra-thin fluid tabular numeral over a mono uppercase caption and a small measurement tick motif. Precise, monochrome, high-contrast counterpoint to light drawing-sheet sections. Tokens-only, no links. Use as a metrics / by-the-numbers / track-record band (completed projects, awards, countries, team size) for architecture firms, design studios, interior designers or any practice wanting a quiet proof-of-scale strip.',
  props: z.object({
    /** Stat entries: large value + caption label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '47', label: 'Completed Projects' },
          { value: '12', label: 'Design Awards' },
          { value: '8', label: 'Countries' },
          { value: '14', label: 'Team Members' },
        ]

    return (
      <section
        aria-label="Studio statistics"
        className={cn(
          // Slanted top seam — the ink survey band cuts in on a diagonal,
          // neighbor-independent.
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.07]" />
        <Container className="relative">
          {/* Mono annotation rail. */}
          <div
            aria-hidden="true"
            className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50"
          >
            <span className="shrink-0 text-background/80">Site data</span>
            <span className="shrink-0">/ Survey</span>
            <span className="h-px flex-1 bg-background/20" />
            <span className="hidden shrink-0 sm:inline">Sheet 04</span>
          </div>

          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-l border-t border-background/20 lg:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/20 p-5 sm:p-8"
                >
                  <StatValue
                    weight={'light'}
                    size={'large'}
                    color={'inverted'}
                    className="text-[clamp(2.75rem,6vw,5.5rem)] font-extralight leading-none tracking-tight tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/60 sm:text-[11px]"
                  >
                    {__iv__.label}
                  </StatLabel>
                  {/* Measurement tick motif. */}
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-end gap-1"
                  >
                    <span className="h-3 w-px bg-background/60" />
                    <span className="h-1.5 w-px bg-background/30" />
                    <span className="h-1.5 w-px bg-background/30" />
                    <span className="h-1.5 w-px bg-background/30" />
                    <span
                      className={cn(
                        'h-3 w-px bg-background/60',
                        i % 2 === 1 && 'bg-primary',
                      )}
                    />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
