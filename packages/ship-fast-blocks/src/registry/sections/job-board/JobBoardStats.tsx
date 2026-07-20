import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardStats — inverted "hiring figures" band for a job-board / careers site.
 * A bg-foreground/text-background band cutting in on a slanted clip-path seam,
 * with an asymmetric mono header row ("Hiring figures" left, "Audited · Live
 * count" right) above a collapsed-border ledger grid of stat cells — each cell
 * carries an index numeral, a giant fluid tabular numeral, and a mono uppercase
 * label. Static, no links. Use as a confidence-building break between sections
 * on job boards, hiring marketplaces or recruiting platforms (active listings,
 * companies hiring, placements, time-to-hire).
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const JobBoardStats = defineCapsule({
  name: 'JobBoardStats',
  description:
    'Inverted hiring-figures band for a job-board / careers site: a bg-foreground/text-background band cutting in on a slanted clip-path seam, with an asymmetric mono header row above a collapsed-border ledger grid of stat cells — each cell carries an index numeral, a giant fluid tabular numeral, and a mono uppercase label. Static, no links. Use as a confidence-building break between sections on job boards, hiring marketplaces or recruiting platforms (active listings, companies hiring, placements, time-to-hire).',
  props: z.object({
    /** Stat figures: value + label. */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '12k+',
            label: 'Active job listings',
          },
          {
            value: '3.2k',
            label: 'Companies hiring',
          },
          {
            value: '48k',
            label: 'Successful placements',
          },
          {
            value: '14 days',
            label: 'Average time to hire',
          },
        ]
    return (
      <section
        className={cn(
          // Slanted top seam: the inverted band cuts in on a diagonal,
          // independent of whichever section sits above it.
          'bg-foreground py-12 pt-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:pt-24 lg:py-16 lg:pt-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4">
            <MonoTag tone="inverted">Hiring figures</MonoTag>
            <MonoTag
              tone="inverted"
              aria-hidden="true"
              className="text-background/40"
            >
              Audited · Live count
            </MonoTag>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/20"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-2 border-b border-r border-background/20 p-5 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums text-background/40"
                  >
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <StatValue
                    weight="semibold"
                    color="inverted"
                    className="mb-0 text-[clamp(2.25rem,4.5vw,4rem)] leading-none"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
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
