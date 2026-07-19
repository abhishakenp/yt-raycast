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
 * CryptoSteps — 3-step numbered process flow for a crypto / DeFi onboarding
 * landing page. A centered heading + description followed by a responsive
 * three-column grid with oversized numbered circles (with connecting border
 * lines on desktop), a bold title, and a description paragraph beneath each
 * step. Use for deploy/connect/onboard flows, integration guides, or getting-
 * started sequences.
 */
export const CryptoSteps = defineCapsule({
  name: 'CryptoSteps',
  description:
    '3-step numbered process flow for a crypto / DeFi onboarding landing page: centered heading + description, then a responsive three-column grid with oversized numbered circles (with connecting border lines on desktop), a bold title, and a description paragraph beneath each step. Use for deploy/connect/onboard flows, integration guides, or getting-started sequences.',
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
          'border-y border-border bg-card py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
          />
          <StepTimelineGrid columns={3} className="gap-8 lg:gap-12">
            {items.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-xl bg-foreground text-lg font-semibold text-background">
                    {i + 1}
                  </div>
                  {i < items.length - 1 && (
                    <div className="hidden h-px flex-1 bg-border md:block" />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
