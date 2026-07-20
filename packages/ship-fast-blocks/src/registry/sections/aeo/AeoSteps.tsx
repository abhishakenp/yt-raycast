import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  StepBadge,
  StepConnector,
  StepItem,
  StepTimeline,
  StepTimelineGrid,
  StepTimelineHeader,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

function stageLabel(title: string, index: number) {
  const word = String(title).trim().split(/\s+/)[0] ?? ''
  return `Stage ${String(index + 1).padStart(2, '0')} — ${word}`
}

/**
 * AeoSteps — "Answer Terminal" pipeline band for an Answer-Engine-Optimization
 * (AEO) SaaS. A left-aligned header with a mono index eyebrow sits above a
 * three-column staggered pipeline: each stage carries a mono "STAGE 01 —
 * CONNECT" label, a bordered rounded-none square badge with a tabular number,
 * a title, and a short description, joined by a dashed hairline connector on
 * desktop with alternate stages offset downward. Use on AEO, generative-search
 * visibility, or brand-citation landing pages to explain the workflow. Renders
 * fully with no props.
 */
export const AeoSteps = defineCapsule({
  name: 'AeoSteps',
  description:
    "Terminal-styled pipeline 'how it works' section for an Answer-Engine-Optimization (AEO) product: a left-aligned mono-labeled header above a staggered three-column pipeline (connect your content, optimize for answer engines, track citations and win), each stage with a mono 'STAGE 01' label, a bordered rounded-none square number badge, a title, and a short description, joined by a dashed hairline connector on desktop. Use to explain the AEO workflow on landing or how-it-works pages.",
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
        className={cn('bg-background py-14 sm:py-20 lg:py-28', props.className)}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <StepTimelineHeader className="mx-0 mb-10 max-w-2xl text-left md:mb-14">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={intro}
              className="gap-0"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              subtitleClassName="mt-4 text-base text-muted-foreground md:text-lg"
            />
          </StepTimelineHeader>
          <StepTimelineGrid columns={3} className="gap-10 md:gap-8" asChild>
            <ol className="relative md:pb-6">
              <StepConnector
                variant="dashed"
                className="left-0 right-0 top-6 w-auto translate-x-0 border-t border-dashed border-primary/40"
              />
              {steps.map((step, i) => (
                <StepItem
                  key={`${step.title}-${i}`}
                  className={cn(
                    'relative grid grid-cols-[3rem_1fr] items-start gap-x-4 text-left transition-transform duration-150 before:absolute before:-bottom-10 before:left-6 before:top-14 before:w-px before:border-l before:border-dashed before:border-primary/40 before:content-[""] last:before:hidden md:flex md:flex-col md:items-start md:before:hidden',
                    i % 2 === 1 && 'md:translate-y-6',
                  )}
                >
                  <StepBadge
                    index={i}
                    variant="filled-square"
                    className="row-span-3 mb-0 size-12 rounded-none border border-foreground bg-background font-mono text-lg font-semibold text-foreground tabular-nums ring-4 ring-background md:mb-5"
                  />
                  <span className="col-start-2 mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    {stageLabel(step.title, i)}
                  </span>
                  <h3 className="col-start-2 mb-2 text-lg font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="col-start-2 text-sm leading-relaxed text-muted-foreground">
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
