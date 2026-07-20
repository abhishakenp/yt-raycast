import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * CybersecuritySteps — terminal-stealth deploy sequence. A muted-wash band
 * opening with a hairline mono meta rule ("DEPLOY SEQUENCE" + tabular phase
 * count) above an asymmetric header (left-aligned heading + lede, mono
 * "[ T-MINUS 24H ]" tag right). The three phases render as a square-edged,
 * collapsed-border ledger: each cell shares hairline rules and carries a giant
 * ghost phase numeral watermark, a mono "PHASE 0X" label, a bold title, and a
 * description. Phase 1 embeds an ink-inverted mono terminal pane with the
 * install one-liner, phase 2 a mono "[ OK ]" checklist, phase 3 a pulsing
 * primary status square with the live label. Pure display, no links. Use to
 * explain fast onboarding for cybersecurity vendors, SOC/MDR providers, or any
 * agent/API-deployed security SaaS. Renders fully with no props via baked-in
 * deployment defaults.
 */
export const CybersecuritySteps = defineCapsule({
  name: 'CybersecuritySteps',
  description:
    "Terminal-stealth deploy sequence: a muted-wash band with a mono meta rule and asymmetric left-aligned header above a square-edged, collapsed-border 3-phase ledger — each cell shares hairline rules and carries a ghost phase numeral, mono 'PHASE 0X' label, bold title and description; phase 1 embeds an ink-inverted mono terminal pane with the install snippet, phase 2 a mono '[ OK ]' checklist, phase 3 a pulsing live-status square. Pure display, no links. Use to explain fast onboarding for cybersecurity vendors, SOC/MDR providers, or any agent/API-deployed security SaaS.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Ordered deployment steps. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Inline code snippet shown under the first step. */
    snippet: z.string().optional(),
    /** Checklist chips shown under the second step. */
    checklist: z.array(z.string()).optional(),
    /** Live-status label shown under the third step. */
    liveLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Deploy in minutes, not months'
    const description =
      props.description ??
      'Get enterprise-grade protection without the enterprise-grade complexity'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Connect your infrastructure',
            description:
              'One-line agent deployment or API integration. Support for AWS, Azure, GCP, Kubernetes, and on-premise environments. No configuration changes required.',
          },
          {
            title: 'Discover & baseline',
            description:
              'Our platform automatically maps your assets, identifies vulnerabilities, and establishes behavioral baselines. Full visibility in under 24 hours.',
          },
          {
            title: 'Start protecting',
            description:
              'Threat detection activates immediately. Customize policies, set up notifications, and access your dashboard. SOC team available 24/7 for escalation.',
          },
        ]
    const snippet = props.snippet ?? 'curl -sL https://sg.io/install | bash'
    const checklist = props.checklist?.length
      ? props.checklist
      : ['Asset inventory', 'Risk scoring', 'Baseline profiles']
    const liveLabel = props.liveLabel ?? 'Live protection active'

    return (
      <StepTimeline
        className={cn('bg-muted/40 py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-10">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Deploy sequence
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {String(items.length).padStart(2, '0')} phases
            </span>
          </div>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ t-minus 24h ]
            </p>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border bg-background"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative flex flex-col border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-4 select-none font-mono text-7xl font-bold leading-none tracking-tighter text-foreground/[0.06] tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                  Phase {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-3 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i === 0 && (
                  <div className="mt-5 rounded-none bg-foreground p-4 font-mono text-xs text-background">
                    <p
                      aria-hidden="true"
                      className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-background/50"
                    >
                      <span>[ sh ] install</span>
                      <span className="inline-block h-2 w-6 bg-background/30" />
                    </p>
                    <p className="break-all">
                      <span
                        aria-hidden="true"
                        className="mr-1.5 text-background/50"
                      >
                        $
                      </span>
                      {snippet}
                    </p>
                  </div>
                )}
                {i === 1 && (
                  <ul className="mt-5 space-y-2">
                    {checklist.map((c) => (
                      <li
                        key={c}
                        className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        <span aria-hidden="true" className="text-foreground">
                          [ OK ]
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
                {i === 2 && (
                  <p className="mt-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="size-2 animate-pulse bg-primary"
                    />
                    {liveLabel}
                  </p>
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
