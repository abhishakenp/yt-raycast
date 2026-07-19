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
 * InteriorDesignProcess — numbered process band on a muted surface for an
 * upscale interior-design / architecture studio. A centered uppercase eyebrow +
 * light-weight heading + supporting paragraph above a responsive four-column row
 * of steps, each prefixed with a large faded two-digit ordinal (01–04) over a
 * medium title and a short description. Editorial, airy and timeless. Use to
 * explain a working methodology — discovery, concept, development, delivery —
 * for interior designers, design studios, architecture or renovation firms.
 * Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignProcess = defineCapsule({
  name: 'InteriorDesignProcess',
  description:
    'Numbered process band on a muted surface for an upscale interior-design / architecture studio: a centered uppercase eyebrow + light-weight heading + supporting paragraph above a responsive four-column row of steps, each prefixed with a large faded two-digit ordinal (01–04) over a medium title and a short description. Editorial, airy and timeless. Use to explain a working methodology such as discovery, concept, development and delivery for interior designers, design studios, architecture or renovation firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'How we work'
    const description =
      props.description ??
      'A refined approach to interior design that ensures every project receives the attention and expertise it deserves.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'In-depth consultation to understand your vision, lifestyle, and spatial needs. We visit your site and assess every dimension.',
          },
          {
            title: 'Concept',
            description:
              'Mood boards, material palettes, and spatial layouts. We present 2-3 distinct design directions for your consideration.',
          },
          {
            title: 'Development',
            description:
              'Detailed drawings, 3D renderings, and furniture specifications. Every element is meticulously planned and documented.',
          },
          {
            title: 'Delivery',
            description:
              'Project management through installation and final styling. We ensure flawless execution down to the last accessory.',
          },
        ]

    return (
      <StepTimeline
        variant="muted"
        className={cn('px-4 py-20 sm:px-6 md:py-28 lg:px-8', props.className)}
      >
        <Container size="xl">
          <StepTimelineHeader>
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="gap-0"
              eyebrowClassName="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
              titleClassName="mb-6 text-3xl font-light text-foreground md:text-4xl"
              subtitleClassName="leading-relaxed text-muted-foreground"
            />
          </StepTimelineHeader>
          <StepTimelineGrid columns={4} className="md:gap-6 lg:gap-12">
            {steps.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <StepBadge index={i} variant="faded-ordinal" pad />
                <div className="pt-12">
                  <h3 className="mb-3 text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
