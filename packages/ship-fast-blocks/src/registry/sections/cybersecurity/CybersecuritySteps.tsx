import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * CybersecuritySteps — deploy-in-minutes timeline. A muted-band section with a
 * centered heading + subheading above a 3-column step layout connected by a
 * dashed horizontal rule (desktop). Each step shows a large numbered square
 * tile, a bold title, and a description; the first step adds an inline mono code
 * snippet, the second a check-marked checklist, and the third a pulsing
 * live-status indicator. Pure display, no links. Use to explain fast onboarding
 * for cybersecurity vendors, SOC/MDR providers, or any agent/API-deployed
 * security SaaS. Renders fully with no props via baked-in deployment defaults.
 */
export const CybersecuritySteps = defineCapsule({
  name: 'CybersecuritySteps',
  description:
    'Deploy-in-minutes timeline: a muted-band section with a centered heading + subheading above a 3-column step layout connected by a dashed horizontal rule (desktop). Each step has a large numbered square tile, bold title and description; step 1 adds an inline mono code snippet, step 2 a check-marked checklist, step 3 a pulsing live-status indicator. Pure display, no links. Use to explain fast onboarding for cybersecurity vendors, SOC/MDR providers, or any agent/API-deployed security SaaS.',
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <StepTimeline className={cn('bg-muted/50 py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <StepTimelineGrid columns={3} className="gap-8 lg:gap-12">
            {items.map((step, i) => (
              <StepItem key={step.title} className="relative">
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden w-full border-t-2 border-dashed border-border md:block"
                  />
                )}
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-foreground text-2xl font-bold text-background">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {i === 0 && (
                  <Card
                    rounded="lg"
                    padding="sm"
                    className="mt-4 font-mono text-xs text-muted-foreground"
                  >
                    {snippet}
                  </Card>
                )}
                {i === 1 && (
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {checklist.map((c) => (
                      <StepItem key={c} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {c}
                      </StepItem>
                    ))}
                  </ul>
                )}
                {i === 2 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {liveLabel}
                  </div>
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
