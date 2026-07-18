import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepTimeline, StepItem } from '#/section-kit/StepTimeline.tsx'

const DEFAULT_STEPS: { title: string; description: string }[] = [
  {
    title: 'Tell us your goals',
    description:
      "Share the subject, grade level, and what you're hoping to achieve — it takes two minutes.",
  },
  {
    title: 'Match with a tutor',
    description:
      'We hand-pick a patient, background-checked tutor whose style fits your learner.',
  },
  {
    title: 'Start learning',
    description:
      'Meet online or in person, on a schedule that works for your family. No long contracts.',
  },
  {
    title: 'Track progress',
    description:
      'Get clear session notes and watch confidence and grades climb week over week.',
  },
]

export const TutoringSteps = defineCapsule({
  name: 'TutoringSteps',
  description:
    'How-it-works band for tutoring sites that lays out the journey as friendly numbered steps. Composes the SectionHeading kit composite for the header, then renders each step as a card with a rounded primary number badge, a title, and a reassuring description, connected by a subtle line on desktop. Accepts a public `steps` prop to override the default four-step flow (tell us your goals, match with a tutor, start learning, track progress). Use it to reduce hesitation by showing parents exactly how getting started works.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How it works'
    const heading = props.heading ?? 'Getting started is simple'
    const subheading =
      props.subheading ??
      'From first hello to real progress in four easy steps.'
    const steps = props.steps?.length ? props.steps : DEFAULT_STEPS

    return (
      <StepTimeline
        className={cn(
          'bg-muted/30 pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative flex flex-col gap-4"
              >
                {i < steps.length - 1 ? (
                  <span
                    className="absolute left-6 top-6 hidden h-px w-full bg-border lg:block"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <Card>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              </StepItem>
            ))}
          </ol>
        </div>
      </StepTimeline>
    )
  },
})
