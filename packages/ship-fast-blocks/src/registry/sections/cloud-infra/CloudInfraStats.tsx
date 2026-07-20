import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraStats — inverted terminal telemetry band for a cloud-infrastructure /
 * developer-platform SaaS landing page. A full bg-foreground/text-background
 * inversion band that cuts in on a slanted top seam. Asymmetric 5/7 split:
 * left carries the heading, description, and trust badges restyled as square
 * bordered status rows (icon tile + title + mono subtitle); right is a
 * collapsed-border 2x2 metric ledger with giant tabular numerals, mono
 * uppercase labels, and tiny primary tick-bar motifs. A faint graph-paper
 * texture and mono telemetry meta line sit behind. Tokens-only. Renders fully
 * on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'
export const CloudInfraStats = defineCapsule({
  name: 'CloudInfraStats',
  description:
    'Inverted terminal telemetry band for a cloud-infrastructure / developer-platform SaaS landing page: a bg-foreground inversion band with a slanted top seam and an asymmetric 5/7 split. Left carries a heading, description, and trust badges as square bordered status rows; right is a collapsed-border 2x2 metric ledger with giant tabular numerals, mono uppercase labels, and tiny tick-bar motifs. Tokens-only. Use for credibility, social-proof, and KPI bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Trust badges: title + subtitle. */
    badges: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
        }),
      )
      .optional(),
    /** Big metric figures: value + label. */
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
    const heading = props.heading ?? 'Trusted by thousands of engineering teams'
    const description =
      props.description ??
      'From startups to Fortune 500s, teams rely on CloudShift for mission-critical infrastructure. Our platform processes billions of requests daily across 35 global regions.'
    const badges = props.badges?.length
      ? props.badges
      : [
          {
            title: '99.99% Uptime SLA',
            subtitle: 'Backed by financial credits',
          },
          {
            title: 'SOC 2 Type II Certified',
            subtitle: 'GDPR and HIPAA compliant',
          },
        ]
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '12K+',
            label: 'Active deployments',
          },
          {
            value: '35',
            label: 'Global regions',
          },
          {
            value: '50B+',
            label: 'Requests/month',
          },
          {
            value: '<20ms',
            label: 'Edge latency',
          },
        ]
    const icons: ReactNode[] = [
      <svg
        key="sla"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg
        key="soc2"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V5a4 4 0 00-8 0v4h8z" />
      </svg>,
    ]
    const tickWidths = ['w-8', 'w-5', 'w-10', 'w-6']
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.06]" />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p
                aria-hidden="true"
                className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
              >
                [ telemetry ] live fleet
              </p>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-4"
                titleClassName="text-3xl font-extrabold tracking-tight text-background sm:text-4xl"
                subtitleClassName="text-base text-background/60 sm:text-lg"
              />
              <div className="mt-8 space-y-3">
                {badges.map((badge, i) => (
                  <div
                    key={badge.title}
                    className="flex items-center gap-4 border border-background/15 p-4"
                  >
                    <div className="grid size-10 shrink-0 place-items-center border border-background/20 text-background">
                      {icons[i % icons.length]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-background">
                        {badge.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-background/50">
                        {badge.subtitle}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="ml-auto size-1.5 shrink-0 animate-pulse bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <StatGrid
                columns={2}
                className="gap-0 border-l border-t border-background/15"
              >
                {items
                  .map((s) => ({ value: s.value, label: s.label }))
                  .map((s, i) => {
                    const __iv__ = s as { value: string; label: string }
                    return (
                      <StatItem
                        key={__iv__.label}
                        align="left"
                        className="gap-3 border-b border-r border-background/15 p-5 sm:p-8 lg:p-10"
                      >
                        <StatValue className="text-[clamp(2.25rem,4.5vw,4rem)] font-extrabold leading-none tracking-tight text-background tabular-nums">
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
                          <span className="h-1 w-1 bg-background/30" />
                          <span className="h-1 w-1 bg-background/30" />
                        </span>
                      </StatItem>
                    )
                  })}
              </StatGrid>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
