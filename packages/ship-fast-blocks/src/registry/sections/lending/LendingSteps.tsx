import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

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
      <section className={cn('bg-muted py-24 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {stepsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{stepsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {stepItems.map((step, i) => (
              <div key={step.title} className="relative">
                <Card rounded="2xl" padding="lg" className="h-full">
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
                </Card>
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
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
