import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsStats — an inverted industrial-manifest KPI ledger band for a global-
 * logistics / freight-forwarding company. A full `bg-foreground text-background`
 * inversion band that cuts in on a slanted top seam, with a faint graph-paper
 * texture and a mono `[ manifest ] fleet ledger` meta line behind. A collapsed-
 * border metric grid (2 → 4 columns) of giant tabular-nums values over mono
 * uppercase captions with tiny tick-bar motifs (countries served, shipments
 * delivered, years in operation, team members). Precise and operational, tokens-
 * only so it inverts cleanly in light and dark. Use beneath the hero or logo strip
 * of a logistics, freight-forwarding, shipping, courier, warehousing or cargo/
 * transport site to quantify scale and trust. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'
export const LogisticsStats = defineCapsule({
  name: 'LogisticsStats',
  description:
    'Inverted industrial-manifest KPI ledger band for a global-logistics / freight-forwarding company: a bg-foreground inversion band with a slanted top seam, a faint graph-paper texture and a mono meta line, over a collapsed-border metric grid (2 → 4 columns) of giant tabular-nums values, mono uppercase captions and tiny tick-bar motifs (e.g. countries served, shipments delivered, years in operation, team members worldwide). Precise and operational, tokens-only. Use beneath the hero or logo strip of a logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport site to quantify scale and trust.',
  props: z.object({
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
            value: '180+',
            label: 'Countries served',
          },
          {
            value: '2.4M',
            label: 'Shipments delivered (2024)',
          },
          {
            value: '24',
            label: 'Years in operation',
          },
          {
            value: '4,200',
            label: 'Team members worldwide',
          },
        ]
    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.06]" />
        <Container className="relative">
          <p
            aria-hidden="true"
            className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
          >
            [ manifest ] fleet ledger
          </p>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-7 lg:p-8"
                >
                  <StatValue className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[10px] uppercase tracking-[0.16em] text-background/60">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={cn(
                        'h-1 bg-background',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
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
