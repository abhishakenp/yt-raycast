import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * IllustratorStats — the inverted achievements band for an illustrator /
 * visual-artist portfolio. A bg-foreground / text-background band cut in on a
 * slanted clip-path seam, with a mono meta header and a giant ghost numeral
 * drifting behind. Metrics sit in a collapsed hairline ledger: each cell pairs a
 * big serif tabular value with a mono uppercase label and a small tick-bar
 * motif. Use as a high-contrast credibility strip between content sections.
 * Renders fully with no props via baked-in defaults.
 */
export const IllustratorStats = defineCapsule({
  name: 'IllustratorStats',
  description:
    'Inverted achievements band for an illustrator / visual-artist portfolio: a bg-foreground / text-background band cut in on a slanted clip-path seam, with a mono meta header and a giant ghost numeral behind, holding a collapsed hairline ledger of metrics where each cell pairs a big serif tabular value with a mono uppercase label and a small tick-bar motif (books published, prints sold, happy clients, awards). Use as a high-contrast credibility strip between content sections.',
  props: z.object({
    /** Metric items shown across the band. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '47', label: 'Books Published' },
          { value: '12k+', label: 'Prints Sold' },
          { value: '35', label: 'Happy Clients' },
          { value: '3', label: 'Industry Awards' },
        ]
    const tickWidths = ['w-6', 'w-10', 'w-4', 'w-8', 'w-12', 'w-5']

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-4 -top-2 text-[10rem] leading-none text-background/[0.05] sm:text-[15rem]">
          &amp;
        </Watermark>
        <Container size="xl" className="relative">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <MonoTag tone="inverted" className="flex items-center gap-2">
              <span aria-hidden="true">*</span>
              By the numbers
            </MonoTag>
            <MonoTag className="text-background/40">[ studio ledger ]</MonoTag>
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
                  className="gap-3 border-b border-r border-background/20 p-6 sm:p-8"
                >
                  <StatValue
                    fontFamily="serif"
                    size="large"
                    color="inverted"
                    className="mb-0 tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="font-mono text-[11px] uppercase tracking-[0.16em]"
                  >
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
