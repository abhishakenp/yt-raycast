import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionProcess — six-step numbered process timeline for a construction /
 * general contractor page. A centered section heading above a responsive grid
 * of numbered cards, each showing a large step number watermark, a title, a
 * description, and a duration note. Use as a "how we bring your vision to
 * life" section for construction companies, contractors, builders, or any
 * service business with a multi-phase workflow. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const ConstructionProcess = defineCapsule({
  name: 'ConstructionProcess',
  description:
    "Six-step numbered process timeline for a construction / general contractor page: a centered section heading above a responsive grid of numbered cards, each showing a large step number watermark, a title, a description, and a duration note. Use as a 'how we bring your vision to life' section for construction firms, contractors, builders, or any service business with a multi-phase workflow.",
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
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="absolute -left-2 -top-4 text-6xl font-bold text-foreground/10">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative rounded-xl bg-card p-8 shadow-sm">
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
