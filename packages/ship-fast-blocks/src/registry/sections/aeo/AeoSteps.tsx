import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  StepBadge,
  StepConnector,
  StepItem,
  StepTimeline,
  StepTimelineGrid,
  StepTimelineHeader,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AeoSteps — bespoke three-step "how it works" band for an Answer-Engine-
 * Optimization (AEO) SaaS. A centered heading block sits above a connected,
 * numbered three-column timeline: connect your content, optimize for answer
 * engines, then track citations and win. Each step shows a gradient numbered
 * badge, a title, and a short description, with a horizontal accent line linking
 * them on desktop. Use on AEO, generative-search visibility, or brand-citation
 * landing pages to explain the workflow. Renders fully with no props.
 */
export const AeoSteps = defineCapsule({
  name: 'AeoSteps',
  description:
    "Bespoke three-step 'how it works' section for an Answer-Engine-Optimization (AEO) product: a centered heading block above a connected, numbered three-column timeline (connect your content, optimize for answer engines, track citations and win), each step with a gradient numbered badge, a title, and a short description, joined by a horizontal accent line on desktop. Use to explain the AEO workflow on landing or how-it-works pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    intro: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How it works'
    const heading = props.heading ?? 'From invisible to cited in three steps'
    const intro =
      props.intro ??
      'No agency, no guesswork — connect your content and let Citeable guide every optimization.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Connect your content',
            description:
              'Add your domain and key pages. Citeable maps your topics and benchmarks how AI engines currently describe you.',
          },
          {
            title: 'Optimize for answer engines',
            description:
              'Get prompt-level recommendations and content rewrites engineered so engines extract and attribute your pages.',
          },
          {
            title: 'Track citations & win',
            description:
              'Watch your share of AI answers climb, get alerts on changes, and prove the uplift with executive-ready reports.',
          },
        ]

    return (
      <StepTimeline
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <StepTimelineHeader className="mb-14">
            <Eyebrow className="text-accent">{eyebrow}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {intro}
            </p>
          </StepTimelineHeader>
          <StepTimelineGrid columns={3} className="gap-10 md:gap-8" asChild>
            <ol className="relative">
              <StepConnector variant="gradient" />
              {steps.map((step, i) => (
                <StepItem
                  key={step.title}
                  className="relative flex flex-col items-center text-center md:items-start md:text-left"
                >
                  <StepBadge
                    index={i}
                    variant="gradient-square"
                    className="mb-5"
                  />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </StepItem>
              ))}
            </ol>
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
