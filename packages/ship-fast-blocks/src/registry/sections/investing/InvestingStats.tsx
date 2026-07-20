import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingStats — Swiss-fintech conviction inversion band for an investing /
 * brokerage page. The page's one confident ink-inverted band (bg-foreground /
 * text-background) that cuts in on a slanted clip-path seam. A mono micro-label
 * meta rule ("[ track record ]" left, tabular metric count right) sits above a
 * collapsed-border grid of stat cells sharing hairline rules; each cell carries
 * a giant fluid tabular-nums numeral, a mono uppercase label, and a small
 * div-built tick-bar motif in background-family tokens. Institutional and calm;
 * use to surface headline trust numbers — assets under management, active
 * investors, countries supported, uptime — between richer sections on a
 * brokerage or trading-app page. Renders fully with no props via four baked-in
 * metrics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const InvestingStats = defineCapsule({
  name: 'InvestingStats',
  description:
    'Swiss-fintech conviction inversion band for an investing / brokerage page: the one ink-inverted band (bg-foreground / text-background) cut on a slanted clip-path seam, with a mono micro-label meta rule (track record left, tabular metric count right) above a collapsed-border grid of stat cells that share hairline rules and carry a giant fluid tabular-nums numeral, a mono uppercase label, and a small div-built tick-bar motif in background-family tokens (assets under management, active investors, countries supported, uptime). Use to surface headline trust numbers between richer sections on a brokerage or trading-app page.',
  props: z.object({
    /** Metric items: value + label. */
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
            value: '$12B+',
            label: 'Assets under management',
          },
          {
            value: '2.4M',
            label: 'Active investors',
          },
          {
            value: '150+',
            label: 'Countries supported',
          },
          {
            value: '99.99%',
            label: 'Platform uptime',
          },
        ]
    const tickWidths = ['w-8', 'w-12', 'w-6', 'w-10', 'w-14', 'w-7']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Container className="relative flex flex-col gap-12">
          <div className="flex items-center justify-between gap-4 border-b border-background/20 pb-6">
            <MonoTag tone="inverted" className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-background" />
              Track record
            </MonoTag>
            <MonoTag
              aria-hidden="true"
              className="shrink-0 tabular-nums text-background/40"
            >
              [ {String(items.length).padStart(2, '0')} metrics ]
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
                  align={'left'}
                  className="gap-3 border-b border-r border-background/20 p-6 sm:p-8 lg:p-10"
                >
                  <StatValue className="mb-0 text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
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
                        'h-1 bg-background',
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
