import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * AeoSteps — bespoke three-step "how it works" band for an Answer-Engine-
 * Optimization (AEO) SaaS. A centered heading block sits above a connected,
 * numbered three-column timeline: connect your content, optimize for answer
 * engines, then track citations and win. Each step shows a gradient numbered
 * badge, a title, and a short description, with a horizontal accent line linking
 * them on desktop. Use on AEO, generative-search visibility, or brand-citation
 * landing pages to explain the workflow. Renders fully with no props.
 */
export const AeoSteps = defineComponent({
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-accent">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              {intro}
            </p>
          </div>
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-accent to-transparent md:block"
            />
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="relative flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-extrabold text-primary-foreground shadow-lg ring-4 ring-background">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  },
})
