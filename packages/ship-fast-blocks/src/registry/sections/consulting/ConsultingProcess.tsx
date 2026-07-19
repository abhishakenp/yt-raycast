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
 * ConsultingProcess — dark 4-step "How We Work" process band for a
 * management-consulting firm page. A centered heading and lead paragraph on a
 * primary-background band above a responsive grid of numbered steps (01–04);
 * each step shows a large muted number, a title and a description. Subtle
 * horizontal connectors between steps (hidden on mobile). Tokens-only, no
 * links. Use as a methodology / workflow / how-it-works section for consulting
 * firms, professional-services groups, or B2B advisory businesses.
 * Renders fully with no props via four baked-in default steps.
 */
export const ConsultingProcess = defineCapsule({
  name: 'ConsultingProcess',
  description:
    "Dark 4-step 'How We Work' process band for a management-consulting firm page: a centered heading and lead paragraph on a primary-background band above a responsive grid of numbered steps (01-04), each with a large muted number, a title and a description; subtle horizontal connectors between steps (hidden on mobile). Tokens-only, no links. Use as a methodology / workflow / how-it-works section for consulting firms, professional-services groups, or B2B advisory businesses.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How We Work'
    const description =
      props.description ??
      'Our proven methodology ensures every engagement delivers measurable, sustainable results.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery & Diagnosis',
            description:
              'We begin by deeply understanding your business, conducting rigorous analysis of your market position, operations, and strategic challenges to identify the core issues.',
          },
          {
            title: 'Strategy Development',
            description:
              'Working collaboratively with your team, we develop tailored strategies that leverage your strengths and address your most critical opportunities and challenges.',
          },
          {
            title: 'Implementation Support',
            description:
              'We roll up our sleeves to help execute the strategy, providing hands-on support for organizational changes, process improvements, and capability building.',
          },
          {
            title: 'Sustained Impact',
            description:
              'We measure success by lasting results. We build your internal capabilities and establish mechanisms to ensure improvements endure long after our engagement.',
          },
        ]

    return (
      <StepTimeline
        className={cn(
          'bg-primary py-24 text-primary-foreground',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-primary-foreground/70"
          />
          <StepTimelineGrid columns={2} className="gap-8 lg:grid-cols-4">
            {steps.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <div className="mb-4 text-6xl font-bold text-primary-foreground/20">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-primary-foreground/60">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden h-px w-full -translate-x-8 bg-primary-foreground/20 lg:block"
                  />
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
