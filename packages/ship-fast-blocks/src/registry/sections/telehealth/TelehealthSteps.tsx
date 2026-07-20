import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * TelehealthSteps — calm clinical + warmth collapsed-border "how it works"
 * ledger for a telehealth site. An asymmetric header (left-aligned heading +
 * lede, mono "[ how it works ]" meta on the right) above a hairline
 * collapsed-border 1-to-3 column ledger of numbered steps; each square cell
 * pairs a giant ghost zero-padded index numeral with a short primary tick dash,
 * a step title, and a description walking a new patient from sign-up to
 * treatment (create your account, connect with a doctor, get your treatment
 * plan). Tokens-only, no links. Precise yet warm, telemedicine aesthetic. Use to
 * reduce friction and reassure first-time visitors that getting care is simple.
 */
export const TelehealthSteps = defineCapsule({
  name: 'TelehealthSteps',
  description:
    "Calm clinical + warmth collapsed-border 'how it works' ledger for a telehealth site: an asymmetric header (left-aligned heading + lede, mono how-it-works meta right) above a hairline collapsed-border 1-to-3 column ledger of numbered steps, each square cell pairing a giant ghost zero-padded index numeral with a short primary tick dash, a step title, and a description walking a new patient from sign-up to treatment (create your account, connect with a doctor, get your treatment plan). Tokens-only, no links. Precise yet warm, telemedicine aesthetic. Use to reduce friction and reassure first-time visitors that getting care is simple.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Care in three simple steps'
    const subheading =
      props.subheading ??
      'No paperwork, no waiting rooms — just a few minutes between you and a doctor.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Create your account',
            description:
              'Tell us a little about yourself and what you need help with — it takes under two minutes.',
          },
          {
            title: 'Connect with a doctor',
            description:
              'Match with a board-certified provider and meet over secure video, often within minutes.',
          },
          {
            title: 'Get your treatment plan',
            description:
              'Receive a personalized plan, prescriptions, and follow-up care delivered straight to you.',
          },
        ]

    return (
      <StepTimeline
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="telehealth-steps-heading"
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              titleId="telehealth-steps-heading"
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              [ how it works ]
            </MonoTag>
          </div>

          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {steps.map((step, i) => (
              <StepItem
                key={`${step.title}-${i}`}
                className="relative flex flex-col gap-4 border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="text-[clamp(3rem,5vw,4.5rem)] font-extrabold leading-none tracking-tight text-foreground/[0.08] tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-primary" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
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
