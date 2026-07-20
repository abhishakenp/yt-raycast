import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * DevToolStats — "system status" metrics ledger for a developer tool / API
 * platform. A top-and-bottom bordered band opening with an aria-hidden mono
 * "$ devstack status --all" rule row and a chart-1 "[ OK ]" chip, above a
 * collapsed-border 2-up (mobile) / 4-up (desktop) ledger of stat cells sharing
 * hairline borders — each with a giant tabular-nums value, a mono uppercase
 * label, and a small div-built terminal meter bar. Static (no links). Use as a
 * credibility strip between sections to highlight developer count, uptime,
 * latency, and request volume for developer tools, API platforms, or technical
 * SaaS.
 */
export const DevToolStats = defineCapsule({
  name: 'DevToolStats',
  description:
    "'System status' metrics ledger for a developer tool / API platform: a top-and-bottom bordered band opening with an aria-hidden mono '$ devstack status --all' rule row and a chart-1 '[ OK ]' chip, above a collapsed-border 2-up (mobile) / 4-up (desktop) ledger of stat cells sharing hairline borders, each with a giant tabular-nums value, a mono uppercase label, and a small div-built terminal meter bar. Use as a credibility strip between sections to highlight developer count, uptime, latency, and request volume for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '50K+', label: 'Active Developers' },
          { value: '99.99%', label: 'Uptime SLA' },
          { value: '50ms', label: 'Global Latency' },
          { value: '2B+', label: 'Requests/Day' },
        ]
    const meterFills = [7, 9, 5, 8]

    return (
      <section
        className={cn('border-y border-border py-14 sm:py-16', props.className)}
        aria-label="Platform statistics"
      >
        <Container>
          <div
            aria-hidden="true"
            className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-3"
          >
            <MonoTag tone="muted">
              <span className="text-primary">$ </span>
              devstack status --all
            </MonoTag>
            <MonoTag className="text-chart-1">[ ok ]</MonoTag>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              const fill = meterFills[i % meterFills.length]
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-2 border-b border-r border-border p-5 sm:p-7"
                >
                  <StatValue
                    weight={'bold'}
                    size={'default'}
                    className="mb-0 font-mono text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-none tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-2 flex items-center gap-0.5"
                  >
                    {Array.from({ length: 10 }, (_, cell) => (
                      <span
                        key={cell}
                        className={cn(
                          'h-1.5 w-2',
                          cell < fill ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    ))}
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
