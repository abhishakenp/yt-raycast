import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LendingSteps — a 3-step "how it works" flow on a muted section band for a
 * lending or fintech marketing page. A centered heading + description above a
 * responsive 3-up grid of white step cards, each with a numbered primary circle
 * badge, a title, a descriptive paragraph, and a small clock-noted time estimate;
 * connecting arrow glyphs sit between cards on desktop. Use to explain a simple
 * apply-and-fund process — check rate, choose terms, get funded — on loan,
 * onboarding, or fintech landing pages. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
export const LendingSteps = defineCapsule({
  name: 'LendingSteps',
  description:
    "3-step 'how it works' flow on a muted band for a lending or fintech marketing page: centered heading + description above a responsive 3-up grid of white step cards, each with a numbered primary circle badge, a title, a descriptive paragraph and a small clock-noted time estimate; connecting arrow glyphs between cards on desktop. Use to explain a simple apply-and-fund process — check rate, choose terms, get funded — on loan, onboarding, or fintech landing pages.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stepsHeading = props.heading ?? 'How it works'
    const stepsDesc =
      props.description ?? 'Three simple steps to get the funds you need.'
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Check your rate',
            description:
              "Tell us how much you need and what it's for. We'll show you personalized rates in 2 minutes—no impact to your credit score.",
            note: 'Takes 2 minutes',
          },
          {
            title: 'Choose your terms',
            description:
              'Pick the loan amount and term that fit your budget. Adjust your monthly payment until it feels right.',
            note: 'Takes 5 minutes',
          },
          {
            title: 'Get funded',
            description:
              "E-sign your documents and we'll deposit funds directly to your bank account as soon as the next business day.",
            note: 'Next day delivery',
          },
        ]
    return (
      <StepTimeline className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={stepsHeading}
            subtitle={stepsDesc}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="tracking-tight sm:text-4xl"
            subtitleClassName="mt-4 text-lg"
          />
          <StepTimelineGrid columns={3} className="gap-8 lg:gap-12">
            {stepItems.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <StepContent className="mt-0 h-full gap-0 rounded-2xl border bg-card p-6">
                  <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{step.note}</span>
                  </div>
                </StepContent>
                {i < stepItems.length - 1 && (
                  <div className="absolute -right-6 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
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
