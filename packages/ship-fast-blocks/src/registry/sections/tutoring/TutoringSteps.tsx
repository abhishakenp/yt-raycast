import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

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
    'How-it-works band for tutoring sites rendered as the page\'s one inverted ink band (foreground background, background text) with a slanted clip-path top seam and a giant serif ghost watermark. Composes the SectionHeading kit composite for a left-aligned mono-eyebrow header, then lays the journey out as a collapsed-border step ledger: each hairline cell carries a giant ghost step numeral, a mono "STEP 01" label, a serif title, and a reassuring description. Accepts a public `steps` prop to override the default four-step flow (tell us your goals, match with a tutor, start learning, track progress). Use it to reduce hesitation by showing parents exactly how getting started works.',
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
        variant="inverted"
        className={cn(
          'relative overflow-hidden pb-20 pt-28 [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-40',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-left-4 bottom-0 font-serif text-[9rem] leading-none text-background/[0.06] sm:text-[16rem]"
        >
          01
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </span>
            <span className="tabular-nums">
              {String(steps.length).padStart(2, '0')} steps
            </span>
          </div>
          <SectionHeading
            align="left"
            title={heading}
            subtitle={subheading}
            className="mb-12 max-w-3xl gap-4 sm:mb-16"
            titleClassName="font-serif text-4xl font-semibold tracking-tight text-background sm:text-5xl"
            subtitleClassName="max-w-xl text-lg text-background/60"
          />
          <ResponsiveGrid
            asChild
            cols="1-2-4"
            className="gap-0 border-l border-t border-background/20"
          >
            <ol>
              {steps.map((step, i) => (
                <StepItem
                  key={step.title}
                  className="relative flex flex-col border-b border-r border-background/20 p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-4 select-none font-serif text-7xl font-bold leading-none tabular-nums text-background/10"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <StepContent className="relative mt-6 gap-0">
                    <h3 className="font-serif text-xl font-semibold tracking-tight text-background">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-background/70">
                      {step.description}
                    </p>
                  </StepContent>
                </StepItem>
              ))}
            </ol>
          </ResponsiveGrid>
        </Container>
      </StepTimeline>
    )
  },
})
