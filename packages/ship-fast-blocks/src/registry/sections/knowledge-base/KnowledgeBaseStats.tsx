import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * KnowledgeBaseStats — "Terminal-docs" hairline metrics ledger for a help
 * center. A calm card band (top/bottom borders) opens with a mono meta rule
 * (primary square, "index" label, tabular entry count) above a collapsed-border
 * grid of left-aligned stat cells: each carries a tabular mono index numeral,
 * a giant extrabold tabular numeral value, a mono uppercase label, and a small
 * div-built tick-bar motif keyed on the primary accent — e.g. help articles,
 * video tutorials, monthly readers and self-service rate. Swiss, hairline,
 * purely presentational (no links). Use between content sections of a
 * knowledge base, support portal or docs site to signal depth and trust.
 * Renders fully with no props via baked-in defaults. Theme tokens only.
 */
export const KnowledgeBaseStats = defineCapsule({
  name: 'KnowledgeBaseStats',
  description:
    "Terminal-docs hairline metrics ledger for a help center: a calm card band with a mono meta rule (primary square + 'index' label + tabular entry count) above a collapsed-border grid of left-aligned stat cells, each with a tabular mono index numeral, a giant extrabold tabular numeral value, a mono uppercase label, and a small div-built tick-bar motif keyed on the primary accent — e.g. help articles, video tutorials, monthly readers and self-service rate. Swiss, hairline and purely presentational. Use between content sections of a knowledge base, support portal or docs site to signal depth and trust.",
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
          { value: '234', label: 'Help Articles' },
          { value: '48', label: 'Video Tutorials' },
          { value: '2.4M', label: 'Monthly Readers' },
          { value: '94%', label: 'Self-Service Rate' },
        ]
    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6', 'w-12', 'w-4']

    return (
      <section
        className={cn(
          'border-y border-border bg-card py-12 sm:py-16',
          props.className,
        )}
        aria-label="Help center statistics"
      >
        <Container>
          {/* Mono meta rule: label left, tabular entry count right. */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Index
            </span>
            <span
              aria-hidden="true"
              className="tabular-nums text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} /{' '}
              {String(items.length).padStart(2, '0')}
            </span>
          </div>

          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-border p-5 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <StatValue
                    weight={'semibold'}
                    size={'default'}
                    className="mb-0 text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-none tracking-tight text-foreground tabular-nums"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
                    <span className="h-1 w-1 bg-border" />
                    <span className="h-1 w-1 bg-border" />
                    <span className="h-1 w-1 bg-border" />
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
