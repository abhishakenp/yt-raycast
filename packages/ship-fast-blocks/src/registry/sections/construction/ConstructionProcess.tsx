import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionProcess — industrial-brutalist phase ledger for a construction /
 * general contractor page. A blueprint graph-paper band opened by a mono meta
 * rule (primary marker square + "Phase index" + tabular phase count) and a
 * left-aligned extrabold uppercase heading. Steps sit in a collapsed-border
 * ledger (1/2/3 columns) whose cells share hairline rules: each carries a
 * giant ghost numeral watermark, a mono primary "Phase NN" label, an uppercase
 * title, a description, and a hairline-ruled mono duration row. Use as a "how
 * we bring your vision to life" section for construction companies,
 * contractors, builders, or any service business with a multi-phase workflow.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'
export const ConstructionProcess = defineCapsule({
  name: 'ConstructionProcess',
  description:
    "Industrial-brutalist phase ledger for a construction / general contractor page: a blueprint graph-paper band with a mono meta rule (primary marker + tabular phase count), a left-aligned extrabold uppercase heading, and a collapsed-border ledger of phase cells sharing hairline rules — each with a giant ghost numeral watermark, a mono primary 'Phase NN' label, an uppercase title, a description, and a hairline-ruled mono duration row. Use as a 'how we bring your vision to life' section for construction firms, contractors, builders, or any service business with a multi-phase workflow.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description + duration. */
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          duration: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'How we bring your vision to life'
    const description =
      props.description ??
      'A proven six-phase process refined over 38 years and 500+ successful projects.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Initial Consultation',
            description:
              'We meet to understand your vision, requirements, timeline, and budget. This free consultation helps us align on project scope and goals.',
            duration: 'Duration: 1-2 hours',
          },
          {
            title: 'Site Assessment',
            description:
              'Our team visits the site to evaluate conditions, utilities, access, and any constraints that may impact the project design or timeline.',
            duration: 'Duration: 1-3 days',
          },
          {
            title: 'Design & Planning',
            description:
              'Architects and engineers develop detailed plans, blueprints, and 3D renderings. We finalize materials, finishes, and specifications.',
            duration: 'Duration: 2-8 weeks',
          },
          {
            title: 'Proposal & Contract',
            description:
              'We present a comprehensive proposal with detailed pricing, timeline, and terms. Upon approval, we finalize contracts and permits.',
            duration: 'Duration: 1-2 weeks',
          },
          {
            title: 'Construction',
            description:
              'Our skilled crews execute the build with daily oversight, quality checks, and regular progress updates to keep you informed.',
            duration: 'Duration: Varies by project',
          },
          {
            title: 'Final Delivery',
            description:
              'Thorough inspections, punch list completion, final walkthrough, and handover of all documentation, warranties, and keys.',
            duration: 'Duration: 1-2 weeks',
          },
        ]
    return (
      <ProcessTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-foreground/[0.05]" />
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-foreground/15 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </span>
            <span className="tabular-nums">
              {String(steps.length).padStart(2, '0')} phases
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-3xl gap-4 lg:mb-14"
            titleClassName="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="max-w-xl text-lg text-muted-foreground"
          />

          <ProcessGrid
            columns={2}
            className="gap-0 border-2 border-foreground bg-card shadow-[8px_8px_0_0] shadow-foreground/15 lg:grid-cols-3"
          >
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative flex flex-col border-b border-r border-foreground/15 p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-4 select-none font-mono text-6xl font-extrabold tabular-nums leading-none text-foreground/[0.08] sm:right-6 sm:top-6 sm:text-7xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Phase {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-extrabold uppercase tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <div className="mt-auto pt-5">
                  <div className="border-t border-dashed border-foreground/20 pt-3 font-mono text-[11px] uppercase tracking-[0.15em] tabular-nums text-muted-foreground">
                    {step.duration}
                  </div>
                </div>
              </ProcessStep>
            ))}
          </ProcessGrid>
        </Container>
      </ProcessTimeline>
    )
  },
})
