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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * CybersecurityStats — terminal-stealth inverted threat ledger. A full ink
 * inversion band (bg-foreground / text-background) that cuts in on a slanted
 * clip-path top seam. An asymmetric header — left-aligned heading + lede, mono
 * "[ LIVE FEED ]" meta with decorative redaction blocks on the right — sits
 * above a collapsed-border 2-to-4 column ledger of stat cells: each carries a
 * giant fluid tabular numeral, a mono uppercase label, the delta/note line,
 * and a small div-built tick-bar motif. A second collapsed-border 3-up ledger
 * row carries the secondary metrics. Pure display, no links, glow-free. Use as
 * an authority band between hero and features for cybersecurity vendors,
 * SOC/MDR providers, or any metrics-driven B2B security SaaS. Renders fully
 * with no props via baked-in threat-intelligence defaults.
 */
export const CybersecurityStats = defineCapsule({
  name: 'CybersecurityStats',
  description:
    'Terminal-stealth inverted threat-intelligence ledger: a full ink-inversion band with a slanted clip-path top seam, an asymmetric header (heading left, mono live-feed meta with redaction blocks right), a collapsed-border 2-to-4 column grid of stat cells with giant tabular numerals, mono labels, delta/note lines and tick-bar motifs, then a collapsed-border 3-up row of secondary metrics. Pure display, no links. Use as an authority/social-proof band between hero and features for cybersecurity vendors, SOC/MDR providers, or any metrics-driven B2B security SaaS.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Primary big-number stats. */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    /** Secondary metrics shown in the bordered-top row. */
    secondary: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Real-time threat intelligence'
    const description =
      props.description ??
      'Our global security network processes billions of events daily'
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '2.4M+',
            label: 'Threats blocked this quarter',
            note: '+18% vs last quarter',
          },
          {
            value: '847ms',
            label: 'Average threat response time',
            note: '-23% improvement',
          },
          {
            value: '99.99%',
            label: 'Platform uptime SLA',
            note: '24/7/365 monitoring',
          },
          {
            value: '156',
            label: 'Countries protected',
            note: 'Global SOC coverage',
          },
        ]
    const secondary = props.secondary?.length
      ? props.secondary
      : [
          {
            value: '$4.2M',
            label:
              'Average customer cost savings from prevented breaches (2024)',
          },
          {
            value: '3,847',
            label: 'Zero-day vulnerabilities discovered and patched',
          },
          {
            value: '12TB',
            label: 'Threat intelligence data processed daily',
          },
        ]
    const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8']

    return (
      <section
        className={cn(
          'bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
              subtitleClassName="text-base text-background/60 sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50"
            >
              [ live feed ]
              <span className="inline-block h-2.5 w-8 bg-background/80" />
              <span className="inline-block h-2.5 w-5 bg-background/40" />
              utc
            </p>
          </div>
          <StatGrid
            columns={4}
            className="grid-cols-2 gap-0 border-l border-t border-background/15 md:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as {
                value: string
                label: string
                note?: string
              }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-2.5 border-b border-r border-background/15 p-5 sm:p-7"
                >
                  <StatValue
                    weight="bold"
                    size="xl"
                    color="inverted"
                    className="mb-0 text-[clamp(2rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/60"
                  >
                    {__iv__.label}
                  </StatLabel>
                  {__iv__.note && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-background/45 tabular-nums">
                      {__iv__.note}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span
                      className={cn(
                        'h-1 bg-background/80',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="h-1 w-1 bg-background/25" />
                    <span className="h-1 w-1 bg-background/25" />
                    <span className="h-1 w-1 bg-background/25" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
          <div className="mt-10 sm:mt-14">
            <p
              aria-hidden="true"
              className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
            >
              // secondary telemetry
            </p>
            <StatGrid
              columns={3}
              className="grid-cols-1 gap-0 border-l border-t border-background/15 sm:grid-cols-3"
            >
              {secondary.map((s) => (
                <StatItem
                  key={s.label}
                  align="left"
                  className="gap-2 border-b border-r border-background/15 p-5 sm:p-6"
                >
                  <StatValue
                    size="default"
                    color="inverted"
                    className="mb-0 text-2xl font-bold leading-none tracking-tight sm:text-3xl"
                  >
                    {s.value}
                  </StatValue>
                  <StatLabel
                    color="inverted"
                    className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-background/50"
                  >
                    {s.label}
                  </StatLabel>
                </StatItem>
              ))}
            </StatGrid>
          </div>
        </Container>
      </section>
    )
  },
})
