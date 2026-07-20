import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorStats — a cinematic "totals" ledger band for a film director or
 * cinematographer. A muted band with a slanted top seam and a giant faint roman-
 * numeral watermark: a mono slate meta rule above a collapsed-border 2/4-column
 * grid of giant extrabold tabular metric numerals over mono labels (each with a
 * small div-built tick motif), then a hairline-collapsed award ledger where each
 * row pairs a mono index with an extrabold award name and a muted detail line.
 * Tokens-only. Use as a credibility / achievements band (projects, awards, views,
 * festival selections, Cannes / AICP / Sundance credits) for filmmakers,
 * directors, DPs, or production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const FilmDirectorStats = defineCapsule({
  name: 'FilmDirectorStats',
  description:
    'Cinematic "totals" ledger band for a film director or cinematographer: a muted band with a slanted top seam and a giant faint roman-numeral watermark, a mono slate meta rule above a collapsed-border 2/4-column grid of giant extrabold tabular metric numerals over mono labels (each with a small div-built tick motif), then a hairline-collapsed award ledger whose rows pair a mono index with an extrabold award name and a muted detail line. Tokens-only. Use as a credibility / achievements band (projects, awards, views, festival selections, Cannes / AICP / Sundance credits) for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    metrics: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    awards: z
      .array(
        z.object({
          name: z.string(),
          detail: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statMetrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: '87',
            label: 'Projects Completed',
          },
          {
            value: '14',
            label: 'Industry Awards',
          },
          {
            value: '40M+',
            label: 'Combined Views',
          },
          {
            value: '6',
            label: 'Festival Selections',
          },
        ]
    const statAwards = props.awards?.length
      ? props.awards
      : [
          {
            name: 'Cannes Lions',
            detail: 'Gold Winner 2023',
          },
          {
            name: 'AICP Awards',
            detail: 'Best Direction 2024',
          },
          {
            name: 'Sundance',
            detail: 'Official Selection 2024',
          },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 pt-24 pb-20 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-4 select-none font-serif font-bold leading-none tracking-tighter text-foreground/[0.04] text-[14rem] lg:text-[22rem]"
        >
          XIV
        </span>
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              By the Numbers
            </span>
            <span className="tabular-nums">Runtime / Totals</span>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {statMetrics.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-border p-5 sm:p-8"
                >
                  <StatValue className="mb-0 text-5xl font-extrabold leading-none tracking-tight tabular-nums lg:text-6xl">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={
                        'h-1 bg-primary ' + tickWidths[i % tickWidths.length]
                      }
                    />
                    <span className="h-1 w-1 bg-foreground/20" />
                    <span className="h-1 w-1 bg-foreground/20" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
          <ResponsiveGrid
            cols="1-md-3"
            className="mt-16 gap-0 border-l border-t border-border"
          >
            {statAwards.map((a, i) => (
              <div
                key={a.name}
                className="border-b border-r border-border p-6 sm:p-8"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {String(i + 1).padStart(2, '0')} / Award
                </span>
                <p className="mt-3 text-lg font-extrabold tracking-tight">
                  {a.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
