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
 * CryptoSteps — Web3-terminal deploy sequence ledger for a crypto / DeFi
 * onboarding landing page. An asymmetric header (left-aligned heading +
 * description, mono "[ SEQ ] 3 STEPS" meta right) above a collapsed-border
 * three-column ledger: each square cell carries a giant ghost step numeral,
 * an inverted square step chip, a bold title, and a description, separated
 * by hairline rules that collapse into a stacked bordered ledger on mobile.
 * Use for deploy/connect/onboard flows, integration guides, or getting-
 * started sequences.
 */
export const CryptoSteps = defineCapsule({
  name: 'CryptoSteps',
  description:
    'Web3-terminal deploy sequence ledger for a crypto / DeFi onboarding landing page: asymmetric left-aligned header with mono sequence meta, then a collapsed-border three-column ledger — each square cell with a giant ghost step numeral, inverted square step chip, bold title, and description, hairline-ruled and stacking into a bordered ledger on mobile. Use for deploy/connect/onboard flows, integration guides, or getting-started sequences.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description. */
    description: z.string().optional(),
    /** Step items (title + description pairs). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Deploy in minutes, not months'
    const description =
      props.description ??
      'From first connection to production deployment, our developer experience is designed for speed.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Connect Wallet',
            description:
              'Integrate with MetaMask, WalletConnect, or 40+ supported wallets. One-line SDK initialization with automatic network detection.',
          },
          {
            title: 'Configure Contracts',
            description:
              'Deploy pre-audited contract templates or upload your own. Automatic verification on Etherscan, Sourcify, and 8+ explorers.',
          },
          {
            title: 'Go Live',
            description:
              'Instant mainnet deployment with automatic monitoring. Real-time alerts, gas optimization, and 99.99% uptime SLA.',
          },
        ]

    return (
      <StepTimeline
        className={cn(
          'border-y border-border bg-card py-16 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ seq ] {items.length} steps
            </p>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border bg-background p-7 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -top-7 select-none font-mono text-[7rem] font-extrabold leading-none tracking-tighter text-foreground/[0.05] tabular-nums"
                >
                  0{i + 1}
                </span>
                <div className="relative mb-5 flex items-center gap-3">
                  <div className="grid size-10 place-items-center bg-foreground font-mono text-sm font-semibold text-background tabular-nums">
                    {i + 1}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    step / 0{i + 1}
                  </span>
                </div>
                <h3 className="relative mb-2 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
