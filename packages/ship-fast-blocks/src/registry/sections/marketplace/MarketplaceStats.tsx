import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * MarketplaceStats — the page's one inverted, slanted scale-metrics band for a
 * multi-vendor marketplace. A full ink inversion (foreground background,
 * background text) cutting in on a slanted clip-path seam over a giant ghost
 * "MARKET" watermark: an asymmetric header (optional left heading + subheading,
 * mono "[ scale ] live index" meta on the right) above a collapsed-border grid
 * of stat cells, each carrying a giant fluid tabular numeral, a mono uppercase
 * label, and a small div-built tick-bar motif (active buyers, verified sellers,
 * live listings, countries served). Theme-token only. Use to convey reach and
 * momentum on online marketplaces, multi-vendor or maker/artisan platforms, and
 * retail aggregators. Renders fully with no props via baked-in "MarketHub"
 * defaults.
 */
export const MarketplaceStats = defineCapsule({
  name: 'MarketplaceStats',
  description:
    "The page's one inverted, slanted scale-metrics band for a multi-vendor marketplace: a full ink inversion (foreground background, background text) cutting in on a slanted clip-path seam over a giant ghost 'MARKET' watermark, with an asymmetric header (optional left heading + subheading, mono '[ scale ] live index' meta right) above a collapsed-border grid of stat cells — each carrying a giant fluid tabular numeral, a mono uppercase label, and a small div-built tick-bar motif (active buyers, verified sellers, live listings, countries served). Theme-token only. Use to convey reach and momentum on online marketplaces, multi-vendor or maker/artisan platforms, and retail aggregators.",
  props: z.object({
    /** Optional centered section heading. */
    heading: z.string().optional(),
    /** Optional supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Stat cells: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'A marketplace that keeps growing'
    const subheading =
      props.subheading ??
      'Millions of buyers and independent sellers trade on MarketHub every day, across every corner of the world.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2M+', label: 'Active buyers' },
          { value: '180K', label: 'Verified sellers' },
          { value: '8M+', label: 'Live listings' },
          { value: '120+', label: 'Countries served' },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-right-[0.04em] top-6 text-[clamp(6rem,16vw,15rem)] uppercase text-background/[0.05]">
          Market
        </Watermark>
        <Container className="relative flex flex-col gap-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {heading ? (
              <SectionHeading
                align="left"
                title={heading}
                subtitle={subheading}
                className="max-w-2xl gap-3"
                titleClassName="text-3xl font-extrabold tracking-tighter text-background sm:text-4xl lg:text-5xl"
                subtitleClassName="max-w-xl text-base leading-relaxed text-background/60"
              />
            ) : null}
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ scale ] live index
            </p>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
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
                      className={cn(
                        'h-1 bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="size-1 bg-background/30" />
                    <span className="size-1 bg-background/30" />
                    <span className="size-1 bg-background/30" />
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
