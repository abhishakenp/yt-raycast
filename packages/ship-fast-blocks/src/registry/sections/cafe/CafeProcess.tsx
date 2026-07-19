import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StepBadge,
  StepItem,
  StepTimeline,
  StepTimelineGrid,
  StepTimelineHeader,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * CafeProcess — dark "farm to cup" numbered process band for a cozy cafe /
 * coffee shop page. A full-bleed inverted section on bg-foreground with
 * text-background: centered cap, serif heading, and description above a 4-up
 * grid. Each step shows a large circular tile with an outlined number (01–04),
 * a serif title, and a small description. No links. Use as a credibility /
 * craft-process block for cafes, roasteries, bakeries, or artisan food brands.
 * Renders fully with no props via baked-in defaults.
 */
export const CafeProcess = defineCapsule({
  name: 'CafeProcess',
  description:
    "Dark 'farm to cup' numbered process band for a cozy cafe page: full-bleed inverted section on bg-foreground with centered cap, serif heading, and description above a 4-up grid. Each step shows a circular tile with an outlined number (01–04), serif title, and description. No links. Use as a credibility / craft-process block for cafes, roasteries, bakeries, or artisan food brands.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'The Process'
    const heading = props.heading ?? 'From farm to cup'
    const description =
      props.description ??
      "Every step matters. We obsess over the details so you don't have to."
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Source',
            description:
              'Direct relationships with small-lot farmers in coffee belt regions',
          },
          {
            title: 'Roast',
            description:
              'Small-batch roasting on our Diedrich IR-12, profiles dialed to origin',
          },
          {
            title: 'Brew',
            description:
              'Precision extraction using refractometers and taste panels',
          },
          {
            title: 'Serve',
            description:
              'Hand-delivered with care, every drink crafted to order',
          },
        ]

    return (
      <StepTimeline
        variant="inverted"
        className={cn('pt-28 pb-20', props.className)}
      >
        <Container size="xl" className="px-6">
          <StepTimelineHeader>
            <SectionHeading
              align="left"
              eyebrow={cap}
              title={heading}
              subtitle={description}
              className="gap-0"
              eyebrowClassName="mb-3 text-sm font-medium uppercase tracking-wider text-primary"
              titleClassName="mb-6 font-serif text-3xl font-medium sm:text-4xl"
              subtitleClassName="text-background/60"
            />
          </StepTimelineHeader>
          <StepTimelineGrid columns={4}>
            {steps.map((step, i) => (
              <StepItem key={step.title} className="space-y-4 text-center">
                <StepBadge
                  index={i}
                  variant="outlined-circle"
                  pad
                  className="mx-auto grid place-items-center font-serif text-2xl text-primary"
                />
                <h3 className="font-serif text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-background/60">{step.description}</p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
