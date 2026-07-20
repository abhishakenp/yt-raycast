import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * DirectoryStats — inverted "circulation figures" band for a local-business
 * directory. A bg-foreground/text-background band cutting in on a slanted
 * clip-path seam, with an asymmetric mono header row ("Circulation" left,
 * "Audited · Live count" right) above a collapsed-border ledger grid of stat
 * cells — each cell carries an index numeral, a giant fluid tabular numeral,
 * and a mono uppercase label. Static, no links. Use directly beneath the hero
 * of local directories, listing marketplaces, or review-and-discovery sites
 * to convey scale and trust.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const DirectoryStats = defineCapsule({
  name: 'DirectoryStats',
  description:
    'Inverted circulation-figures band for a local-business DIRECTORY: a bg-foreground/text-background band cutting in on a slanted clip-path seam, with an asymmetric mono header row above a collapsed-border ledger grid of stat cells — each cell carries an index numeral, a giant fluid tabular numeral, and a mono uppercase label (businesses listed, verified reviews, cities covered, average rating). Static, no links. Use directly beneath the hero of local directories, listing marketplaces, find-a-service platforms, or review-and-discovery sites to convey scale and trust.',
  props: z.object({
    /** Stat tiles (big value + label). */
    stats: z
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
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '12,450+',
            label: 'Local Businesses',
          },
          {
            value: '48,200+',
            label: 'Verified Reviews',
          },
          {
            value: '156',
            label: 'Cities Covered',
          },
          {
            value: '4.8',
            label: 'Average Rating',
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
            <MonoTag tone="inverted">Circulation</MonoTag>
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
            {stats.map((s, i) => {
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
