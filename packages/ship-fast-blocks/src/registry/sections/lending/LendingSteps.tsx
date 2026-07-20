import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LendingSteps — Swiss-fintech "how it works" step ledger on a muted band for a
 * lending or fintech marketing page. An asymmetric header (left-aligned heading +
 * lede, mono step count right) sits above a sharp-cornered, collapsed-border
 * 3-column grid whose cells share hairline rules (binary radius, no gaps); each
 * cell carries a giant ghost tabular numeral watermark, a mono primary "Step 01"
 * label, a title, a description, and a small mono clock-noted time estimate. Use
 * to explain a simple apply-and-fund process — check rate, choose terms, get
 * funded — on loan, onboarding, or fintech landing pages. Renders fully with no
 * props via baked-in defaults.
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
    "Swiss-fintech 'how it works' step ledger on a muted band for a lending or fintech marketing page: an asymmetric header (left-aligned heading + lede, mono step count right) above a sharp-cornered, collapsed-border 3-column grid whose cells share hairline rules and carry a giant ghost tabular numeral watermark, a mono primary 'Step 01' label, a title, a description and a small mono clock-noted time estimate. Use to explain a simple apply-and-fund process — check rate, choose terms, get funded — on loan, onboarding, or fintech landing pages.",
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
          <div className="mb-10 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={stepsHeading}
              subtitle={stepsDesc}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ {String(stepItems.length).padStart(2, '0')} steps ]
            </p>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {stepItems.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border bg-card"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 top-2 select-none font-mono text-8xl font-bold tabular-nums leading-none text-foreground/[0.06]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <StepContent className="relative mt-0 h-full gap-0 rounded-none border-0 bg-transparent p-7 sm:p-8">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mb-3 mt-4 text-xl font-semibold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-5 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{step.note}</span>
                  </div>
                </StepContent>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
