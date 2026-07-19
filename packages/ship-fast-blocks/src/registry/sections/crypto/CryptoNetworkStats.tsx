import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * CryptoNetworkStats — inverted dark data-band for a crypto / DeFi
 * infrastructure landing page. A `bg-foreground` section holding KPI counter
 * cells (value + label), a 24h transaction volume mini bar chart with a
 * change badge and update timestamp, and a network health panel with a live
 * pulsing status dot plus metric rows (label/value pairs). Use as a trust-
 * building stats band for protocols, chains, bridges, or staking networks.
 */
export const CryptoNetworkStats = defineCapsule({
  name: 'CryptoNetworkStats',
  description:
    'Inverted dark data-band for a crypto / DeFi infrastructure landing page: bg-foreground section containing KPI counter cells (value + label), a 24h transaction volume mini bar chart with a change badge and update timestamp, and a network health panel with a live pulsing status dot plus metric rows (label/value pairs). Use as a trust-building stats band for protocols, chains, bridges, or staking networks.',
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
          'bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-background/60"
          />
          <StatGrid columns={4} className={'mb-12'}>
            {kpis
              .map((kpi) => ({
                value: kpi.value,
                label: kpi.label,
              }))
              .map((s) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem key={__iv__.label}>
                    <StatValue>{__iv__.value}</StatValue>
                    <StatLabel>{__iv__.label}</StatLabel>
                  </StatItem>
                )
              })}
          </StatGrid>
          <ResponsiveGrid cols="1-md-2" gap="md" className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-background/20 bg-background/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-background/90">
                  {volumeLabel}
                </h4>
                <span className="text-sm text-primary">{volumeChange}</span>
              </div>
              <div className="flex h-24 items-end gap-2">
                {volumeBars.map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-t',
                      i === volumeBars.length - 1
                        ? 'bg-primary/80'
                        : 'bg-background/40',
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-background/50">{volumeUpdated}</p>
            </div>
            <div className="rounded-xl border border-background/20 bg-background/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-background/90">
                  {healthLabel}
                </h4>
                <span className="flex items-center gap-2 text-sm text-primary">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  {healthStatus}
                </span>
              </div>
              <div className="space-y-3">
                {health.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-background/60">{h.label}</span>
                    <span className="text-background">{h.value}</span>
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
