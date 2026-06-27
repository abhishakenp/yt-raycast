import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyProcess — a numbered 'how we work' process timeline. A centered
 * eyebrow + heading + description above a responsive 4-up grid of steps, each with
 * a filled primary number badge, a step title, and a short description; a thin
 * connector line bridges adjacent steps on desktop. Use to explain a working
 * methodology (discovery, strategy, execution, scale) for marketing / growth
 * agencies, consultancies, or service firms. Renders fully with no props.
 */
export const MarketingAgencyProcess = defineCapsule({
  name: 'MarketingAgencyProcess',
  description:
    "Numbered 'how we work' process timeline: a centered eyebrow + heading + description above a responsive 4-up grid of steps, each with a filled primary number badge, a step title, and a short description; a thin connector line bridges adjacent steps on desktop. Use to explain a working methodology (discovery, strategy, execution, scale) for marketing / growth agencies, consultancies, or service firms.",
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
    const heading = props.heading ?? 'How We Work'
    const description =
      props.description ??
      'A proven framework that delivers consistent results.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'Deep dive into your business, competitors, and current performance. We audit every channel and identify quick wins.',
          },
          {
            title: 'Strategy',
            description:
              'Custom growth roadmap with clear milestones, budget allocation, and KPIs. Everything documented in Notion.',
          },
          {
            title: 'Execution',
            description:
              'Campaign launches, creative production, and iterative optimization. Weekly standups and async updates.',
          },
          {
            title: 'Scale',
            description:
              'Double down on winners, cut losers, and expand to new channels. Monthly strategy reviews and pivoting.',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border md:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
