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

/**
 * FintechStats — Swiss-fintech trust inversion band for a neobank landing page.
 * The page's one confident ink-inverted band (bg-foreground / text-background)
 * that cuts in on a slanted clip-path seam. An asymmetric header (optional
 * left-aligned heading + lede, mono "[ LIVE LEDGER ]" meta right) sits above a
 * collapsed-border grid of stat cells sharing hairline rules; each cell carries
 * a giant fluid tabular-nums numeral, a mono uppercase label, and a small
 * div-built tick-bar motif in background-family tokens. Institutional and calm;
 * use to establish scale and credibility on banking, payments, wallet, or
 * lending pages. Renders fully with no props via baked-in "Vault" defaults.
 */
export const FintechStats = defineCapsule({
  name: 'FintechStats',
  description:
    'Swiss-fintech trust inversion band for a neobank / fintech landing page: the one ink-inverted band (bg-foreground / text-background) cut on a slanted clip-path seam, with an asymmetric header (optional left-aligned heading + lede, mono live-ledger meta right) above a collapsed-border grid of stat cells that share hairline rules and carry a giant fluid tabular-nums numeral, a mono uppercase label, and a small div-built tick-bar motif in background-family tokens (active users, transactions processed, uptime). Use to establish scale and credibility on banking, payments, wallet, or lending pages.',
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
    const heading = props.heading ?? 'Trusted by people who move money'
    const subheading =
      props.subheading ??
      'Millions rely on Vault every day to send, save, and spend with confidence.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '3.2M+', label: 'Active users' },
          { value: '$48B', label: 'Transactions processed' },
          { value: '99.99%', label: 'Uptime guaranteed' },
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
          <div className="flex flex-col gap-6 border-b border-background/20 pb-6 md:flex-row md:items-end md:justify-between">
            {heading ? (
              <SectionHeading
                align="left"
                title={heading}
                subtitle={subheading}
                className="max-w-2xl gap-3"
                titleClassName="text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
                subtitleClassName="text-background/60"
              />
            ) : (
              <span />
            )}
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ live ledger ]
            </p>
          </div>
          <StatGrid
            columns={3}
            className="gap-0 border-l border-t border-background/20"
          >
            {stats.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-background/20 p-6 sm:p-8 lg:p-10"
                >
                  <StatValue className="mb-0 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
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
