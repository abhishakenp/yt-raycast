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
 * PropertyListingStats — dark inverted proof band for a property marketplace.
 * A full ink inversion (bg-foreground / text-background) cutting in on a slanted
 * clip-path seam, with an asymmetric header (title left, mono "[ market ] live
 * index" meta right) above a collapsed-border grid of KPI cells. Each cell
 * carries a giant fluid tabular numeral, a mono uppercase label, and a small
 * div-built tick-bar motif. Defaults cover total listings, cities covered,
 * partner agents, and monthly visitors. Use to convey the reach and liquidity of
 * a property marketplace. Renders fully with no props via baked-in defaults.
 */
export const PropertyListingStats = defineCapsule({
  name: 'PropertyListingStats',
  description:
    'Dark inverted proof band for a property marketplace: a full ink inversion (bg-foreground / text-background) cutting in on a slanted clip-path seam, with an asymmetric header (title left, mono market meta right) above a collapsed-border grid of KPI cells, each with a giant fluid tabular numeral, a mono uppercase label, and a small div-built tick-bar motif. Defaults cover total listings, cities covered, partner agents, and monthly visitors. Use to convey the reach and liquidity of a property marketplace.',
  props: z.object({
    /** Optional section heading. */
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
    const heading = props.heading ?? 'The marketplace renters trust'
    const description =
      props.description ??
      'More listings, more cities, more ways to find the right place.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '120K+', label: 'Active listings' },
          { value: '340', label: 'Cities covered' },
          { value: '8,500', label: 'Partner agents' },
          { value: '4.2M', label: 'Monthly visitors' },
        ]

    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={cn(
          // Slanted top edge — the inversion band cuts in on a diagonal,
          // neighbor-independent.
          'bg-foreground px-6 py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:px-8 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Container size="xl">
          {heading || description ? (
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="max-w-2xl gap-2"
                titleClassName="text-3xl font-extrabold tracking-tighter text-background sm:text-4xl"
                subtitleClassName="text-background/60"
              />
              <p
                aria-hidden="true"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
              >
                [ market ] live index
              </p>
            </div>
          ) : null}
          <StatGrid
            columns={4}
            className="mt-0 gap-0 border-l border-t border-background/15"
          >
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                >
                  <StatValue className="mb-0 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-tighter text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
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
                    <span className="h-1 w-1 bg-background/30" />
                    <span className="h-1 w-1 bg-background/30" />
                    <span className="h-1 w-1 bg-background/30" />
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
