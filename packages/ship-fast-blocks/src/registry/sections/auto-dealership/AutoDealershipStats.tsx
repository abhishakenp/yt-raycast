import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * AutoDealershipStats — showroom-kinetic dealer-record band for an auto
 * dealership site. A full-bleed dark inversion band (bg-foreground) that cuts
 * in on a diagonal top seam over a faint speed-line texture, headed by an
 * aria-hidden mono meta row ("[ 03 ] — Dealer record" / "Verified — all-time"),
 * above a collapsed-border 2-up / 4-up grid of stat cells. Each cell carries a
 * giant fluid italic font-black tabular numeral (years in business, vehicles
 * sold, Google rating, repeat customers), a mono uppercase label, and a skewed
 * primary speed-tick motif. Static, content-only — no links. Use as a
 * confidence / credibility band between sections for car dealerships, used-car
 * lots, or auto sales groups. Renders fully with no props via baked-in
 * defaults.
 */
export const AutoDealershipStats = defineCapsule({
  name: 'AutoDealershipStats',
  description:
    'Showroom-kinetic dealer-record band for an auto dealership site: a full-bleed dark inversion band cutting in on a diagonal top seam over a faint speed-line texture, with a mono meta row above a collapsed-border 2-up / 4-up grid of stat cells — each a giant fluid italic font-black tabular numeral (years in business, vehicles sold, Google rating, repeat customers) with a mono uppercase label and a skewed primary speed-tick motif. Static and content-only with no links. Use as a confidence / credibility band between sections for car dealerships, used-car lots, or auto sales groups.',
  props: z.object({
    /** Metric figures shown in the band. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '15+', label: 'Years in Business' },
          { value: '8,500+', label: 'Vehicles Sold' },
          { value: '4.9', label: 'Google Rating' },
          { value: '78%', label: 'Repeat Customers' },
        ]
    const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8']

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-24 text-background [clip-path:polygon(0_3.5rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:py-20 lg:pt-32',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(115deg,currentColor,currentColor_1px,transparent_1px,transparent_18px)] text-background/[0.07] [mask-image:linear-gradient(to_right,black,transparent)]"
        />
        <Container className="relative">
          <div
            aria-hidden="true"
            className="mb-8 flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-3">
              <span className="inline-block h-2 w-6 -skew-x-12 bg-primary" />
              <MonoTag tone="inverted">[ 03 ] — Dealer record</MonoTag>
            </span>
            <MonoTag className="text-background/40">
              Verified — all-time
            </MonoTag>
          </div>
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
                  className="gap-2 border-b border-r border-background/15 p-5 sm:p-8"
                >
                  <StatValue
                    weight="bold"
                    color="inverted"
                    className="mb-0 text-[clamp(2.5rem,4.5vw,4.25rem)] font-black italic leading-none tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/60"
                  >
                    {__iv__.label}
                  </StatLabel>
                  <span aria-hidden="true" className="mt-2 flex gap-1">
                    <span
                      className={cn(
                        'h-1.5 -skew-x-12 bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="h-1.5 w-2 -skew-x-12 bg-background/25" />
                    <span className="h-1.5 w-2 -skew-x-12 bg-background/25" />
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
