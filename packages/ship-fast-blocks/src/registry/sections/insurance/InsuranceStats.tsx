import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceStats — Swiss-trust inversion band for an insurance page. The page's
 * one confident ink-inverted band (bg-foreground / text-background) that cuts in
 * on a slanted clip-path seam. A mono "[ claims ledger ]" meta rule sits above a
 * collapsed-border grid of stat cells sharing hairline rules; each cell carries
 * a giant fluid tabular-nums coverage numeral, a mono uppercase label, and a
 * small div-built tick-bar motif in background-family tokens. Institutional and
 * calm; use between content sections to surface families protected, claims
 * processed/approved amounts, claims-approved rate, and customer rating for
 * insurance carriers, insurtech, brokers, or financial-protection products.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const InsuranceStats = defineCapsule({
  name: 'InsuranceStats',
  description:
    'Swiss-trust inversion band for an insurance page: the one ink-inverted band (bg-foreground / text-background) cut on a slanted clip-path seam, with a mono claims-ledger meta rule above a collapsed-border grid of stat cells that share hairline rules and carry a giant fluid tabular-nums coverage numeral, a mono uppercase label, and a small div-built tick-bar motif in background-family tokens (families protected, claims processed/approved amounts, claims-approved rate, customer rating). Use between content sections to surface institutional scale and trust.',
  props: z.object({
    /** Stat items (big value + label). */
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
            value: '50K+',
            label: 'Families Protected',
          },
          {
            value: '$2.4B',
            label: 'Claims Processed',
          },
          {
            value: '98%',
            label: 'Claims Approved',
          },
          {
            value: '4.9/5',
            label: 'Customer Rating',
          },
        ]
    const tickWidths = ['w-8', 'w-12', 'w-6', 'w-10']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Container className="relative flex flex-col gap-10">
          <div className="flex items-center justify-between gap-4 border-b border-background/20 pb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              By the numbers
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ claims ledger ]
            </span>
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
                  <StatValue className="mb-0 text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">
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
