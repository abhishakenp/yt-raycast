import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { CountUp } from '#/section-kit/motion.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StatItem, StatValue, StatLabel } from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AuthStats — proof-by-numbers ledger for Authly, a developer authentication
 * product. A left-aligned heading sits beside a live "metrics snapshot"
 * console card; below, an open ledger of offset columns — each metric under a
 * heavy top rule counts up into an oversized tabular numeral above a mono
 * signal label, with no card chrome. Baked metrics quantify the platform's
 * scale and reliability — logins served per month, developers building on it,
 * an uptime SLA, and countries covered. Use to back an auth platform,
 * identity API, or login SDK with hard numbers. Renders fully with no props.
 */
export const AuthStats = defineCapsule({
  name: 'AuthStats',
  description:
    "Proof-by-numbers ledger for a developer-auth product: a left-aligned heading ('Identity infrastructure at scale') beside a live 'metrics snapshot' console card, above an open card-free ledger of offset columns whose oversized tabular numerals count up on scroll beneath heavy top rules and mono signal labels. Baked metrics quantify scale and reliability — logins served per month, developers building on the platform, an uptime SLA, and countries covered. Use to back an auth platform, identity API, or login SDK with hard numbers.",
  props: z.object({
    /** Optional section heading above the stats. */
    heading: z.string().optional(),
    /** Optional subheading. */
    subheading: z.string().optional(),
    /** Stats: value + label. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Identity infrastructure at scale'
    const subheading =
      props.subheading ??
      'Teams of every size trust Authly to authenticate their users every second of every day.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '5B+', label: 'Logins / mo' },
          { value: '40K+', label: 'Developers' },
          { value: '99.99%', label: 'Uptime SLA' },
          { value: '190+', label: 'Countries' },
        ]
    const statLayouts = [
      'md:col-span-2 xl:col-span-3',
      'md:col-span-2 xl:col-span-3 xl:translate-y-5',
      'md:col-span-2 xl:col-span-3',
      'md:col-span-2 xl:col-span-3 xl:translate-y-5',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-y border-border bg-muted/40',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 -rotate-6 select-none font-mono text-[10rem] font-bold leading-none tracking-tighter text-foreground/[0.05] sm:text-[16rem]"
        >
          {stats[0]?.value}
        </span>
        <Container
          size="xl"
          className="relative px-5 py-16 sm:px-5 sm:py-20 lg:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
            <div>
              <SectionHeading
                title={heading}
                subtitle={subheading}
                align="left"
                className="max-w-3xl"
                titleClassName="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
                subtitleClassName="text-pretty leading-7"
              />
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 font-mono text-xs text-muted-foreground shadow-sm shadow-foreground/5">
              <div className="flex items-center justify-between border-b border-border pb-3 uppercase tracking-[0.14em]">
                <span>metrics snapshot</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                  live
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {stats.slice(0, 3).map((stat, index) => (
                  <div
                    key={stat.label}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                  >
                    <span className="text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{stat.label}</span>
                    <span className="text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 items-start gap-x-8 gap-y-10 md:grid-cols-4 xl:grid-cols-12 sm:mt-14">
            {stats.map((stat, index) => (
              <StatItem
                key={stat.label}
                className={cn(
                  'min-w-0 border-t-2 border-foreground/80 pt-5 text-left',
                  statLayouts[index % statLayouts.length],
                )}
                align="left"
              >
                <span className="mb-8 block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  signal {String(index + 1).padStart(2, '0')}
                </span>
                <StatValue
                  size="large"
                  className="break-words font-mono font-bold tabular-nums tracking-tighter text-foreground lg:text-6xl"
                >
                  <CountUp value={stat.value} />
                </StatValue>
                <StatLabel className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </StatLabel>
              </StatItem>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
