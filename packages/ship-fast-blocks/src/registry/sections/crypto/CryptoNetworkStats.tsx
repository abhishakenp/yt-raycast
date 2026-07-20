import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * CryptoNetworkStats — Web3-terminal inverted data band for a crypto / DeFi
 * infrastructure landing page. A `bg-foreground` section that cuts in on a
 * slanted clip-path seam, with an asymmetric header (heading left, mono
 * "[ LIVE ] MAINNET FEED" meta right), a collapsed-border KPI ledger of
 * giant tabular numerals over mono uppercase labels, and an asymmetric 7/5
 * panel row: a 24h transaction volume bar chart with ▲ change readout and
 * mono timestamp, plus a network health ledger with a pulsing status block
 * and hairline metric rows. A ghost Ξ watermark backs the band. Use as a
 * trust-building stats band for protocols, chains, bridges, or staking
 * networks.
 */
export const CryptoNetworkStats = defineCapsule({
  name: 'CryptoNetworkStats',
  description:
    'Web3-terminal inverted data band for a crypto / DeFi infrastructure landing page: bg-foreground section with a slanted clip-path top seam, asymmetric header (heading left, mono live-feed meta right), collapsed-border KPI ledger of giant tabular numerals with mono uppercase labels, and an asymmetric 7/5 panel row holding a 24h volume bar chart with ▲ change readout plus a network health ledger with pulsing status block and hairline metric rows, backed by a ghost Ξ watermark. Use as a trust-building stats band for protocols, chains, bridges, or staking networks.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description. */
    description: z.string().optional(),
    /** KPI counters (value + label pairs). */
    kpis: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Volume chart panel heading. */
    volumeLabel: z.string().optional(),
    /** Volume change badge text. */
    volumeChange: z.string().optional(),
    /** Volume panel timestamp text. */
    volumeUpdated: z.string().optional(),
    /** Health panel heading. */
    healthLabel: z.string().optional(),
    /** Health status text. */
    healthStatus: z.string().optional(),
    /** Health metric rows (label + value pairs). */
    health: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Network Statistics'
    const description =
      props.description ??
      'Live data from the NexusChain mainnet and bridge infrastructure.'
    const kpis = props.kpis?.length
      ? props.kpis
      : [
          { value: '$2.4B', label: 'Total Value Locked' },
          { value: '847K', label: 'Daily Transactions' },
          { value: '156', label: 'Validators Active' },
          { value: '$0.002', label: 'Avg. Transaction Fee' },
        ]
    const volumeLabel = props.volumeLabel ?? 'Transaction Volume (24h)'
    const volumeChange = props.volumeChange ?? '+8.3%'
    const volumeUpdated = props.volumeUpdated ?? 'Updated: 2 minutes ago'
    const healthLabel = props.healthLabel ?? 'Network Health'
    const healthStatus = props.healthStatus ?? 'Operational'
    const health = props.health?.length
      ? props.health
      : [
          { label: 'Block Time', value: '2.1s avg' },
          { label: 'Finality', value: '~400ms' },
          { label: 'Uptime (30d)', value: '99.97%' },
          { label: 'Active Validators', value: '156 / 156' },
        ]

    const volumeBars = [45, 60, 55, 70, 65, 80, 75, 90, 100]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-bottom-10 right-0 text-[10rem] text-background/[0.05] sm:text-[18rem]">
          Ξ
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-background text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="text-background/60 text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              [ live ] mainnet feed
            </p>
          </div>
          <StatGrid
            columns={4}
            className="mb-12 gap-0 border-l border-t border-background/15"
          >
            {kpis
              .map((kpi) => ({
                value: kpi.value,
                label: kpi.label,
              }))
              .map((s, i) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem
                    key={__iv__.label}
                    align="left"
                    className="gap-3 border-b border-r border-background/15 p-5 sm:p-8"
                  >
                    <StatValue className="text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-none tracking-tight text-background tabular-nums">
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
                          ['w-8', 'w-5', 'w-10', 'w-6'][i % 4],
                        )}
                      />
                      <span className="h-1 w-1 bg-background/30" />
                      <span className="h-1 w-1 bg-background/30" />
                    </span>
                  </StatItem>
                )
              })}
          </StatGrid>
          <ResponsiveGrid
            cols="1-md-2"
            className="gap-0 divide-y divide-background/15 border border-background/15 md:grid-cols-1 lg:grid-cols-[7fr_5fr] lg:divide-x lg:divide-y-0"
          >
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/80">
                  {volumeLabel}
                </h4>
                <span className="flex items-center gap-1 font-mono text-sm tabular-nums text-primary">
                  <span aria-hidden="true">▲</span>
                  {volumeChange}
                </span>
              </div>
              <div className="flex h-28 items-end gap-1.5">
                {volumeBars.map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1',
                      i === volumeBars.length - 1
                        ? 'bg-primary'
                        : 'bg-background/30',
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-background/40">
                {volumeUpdated}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/80">
                  {healthLabel}
                </h4>
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
                  <span
                    aria-hidden="true"
                    className="size-2 animate-pulse bg-primary"
                  />
                  {healthStatus}
                </span>
              </div>
              <div className="divide-y divide-background/15">
                {health.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
                      {h.label}
                    </span>
                    <span className="tabular-nums text-background">
                      {h.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
