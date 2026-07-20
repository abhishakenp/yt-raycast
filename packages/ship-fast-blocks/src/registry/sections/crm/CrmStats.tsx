import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CrmStats — collapsed-border KPI ledger band for a CRM / SaaS landing page.
 * A hairline top-and-bottom strip with a mono "[ METRICS ] LIVE" micro-label
 * rail, then a sharp 2/4-up collapsed-border grid of left-aligned stat cells:
 * each carries a giant fluid tabular-nums value, a mono uppercase label, and a
 * small div-built tick-bar motif (one primary tick per cell). Quietly
 * authoritative, ledger-precise social proof. Use between content sections to
 * surface headline numbers (active teams, pipeline managed, conversion lift,
 * rating) for CRM, sales-pipeline or B2B SaaS products. Renders fully with no
 * props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const CrmStats = defineCapsule({
  name: 'CrmStats',
  description:
    'Collapsed-border KPI ledger band for a CRM / SaaS landing page: a hairline top-and-bottom strip with a mono metrics micro-label rail above a sharp 2/4-up collapsed-border grid of left-aligned stat cells, each with a giant fluid tabular-nums value, a mono uppercase label and a small div-built tick-bar motif. Quietly authoritative ledger-precise social proof. Use between content sections to surface headline numbers (active teams, pipeline managed, conversion lift, rating) for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** KPI metrics. */
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
            value: '15,000+',
            label: 'Active teams',
          },
          {
            value: '$2.4B',
            label: 'Pipeline managed',
          },
          {
            value: '34%',
            label: 'Avg. conversion lift',
          },
          {
            value: '4.9/5',
            label: 'Customer rating',
          },
        ]
    const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8', 'w-5', 'w-9']
    return (
      <section
        className={cn(
          'border-y border-border bg-background py-14 lg:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center gap-4">
            <MonoTag>
              Metrics
              <span aria-hidden="true" className="text-primary">
                {' '}
                · live
              </span>
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              [ q2 rollup ]
            </MonoTag>
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
                  className="gap-3 border-b border-r border-border p-5 sm:p-7"
                >
                  <StatValue
                    weight={'bold'}
                    size={'large'}
                    className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {__iv__.label}
                  </StatLabel>
                  <span aria-hidden="true" className="flex items-center gap-1">
                    <span
                      className={cn(
                        'h-1 bg-primary',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="h-1 w-1 bg-foreground/20" />
                    <span className="h-1 w-1 bg-foreground/20" />
                    <span className="h-1 w-1 bg-foreground/20" />
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
