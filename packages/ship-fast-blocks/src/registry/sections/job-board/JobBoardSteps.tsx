import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardSteps — a 3-step "how it works" timeline for a job-board / careers
 * site. A muted band with a centered heading + description above a 3-column grid
 * connected by a horizontal rule on desktop, each step showing a numbered round
 * primary badge, a title, and a supporting paragraph. Use to explain the
 * candidate journey (create profile, discover & apply, get hired) on job boards,
 * hiring marketplaces or recruiting platforms. Static (no links). Renders fully
 * with no props.
 */
export const JobBoardSteps = defineComponent({
  name: 'JobBoardSteps',
  description:
    "3-step 'how it works' timeline for a job-board / careers site: a muted band with a centered heading + description above a 3-column grid connected by a horizontal rule on desktop, each step showing a numbered round primary badge, a title and a supporting paragraph. Use to explain the candidate journey (create profile, discover & apply, get hired) on job boards, hiring marketplaces or recruiting platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Steps: title + description (numbered automatically). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How it works'
    const description =
      props.description ?? 'Three simple steps to your next career opportunity'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your profile',
            description:
              'Upload your resume, set your preferences, and let employers discover you. Complete profiles get 3x more views.',
          },
          {
            title: 'Discover & apply',
            description:
              'Browse curated listings, filter by what matters to you, and apply with one click using your saved profile.',
          },
          {
            title: 'Get hired',
            description:
              'Connect directly with hiring managers, interview, and land your next role. Average placement in 14 days.',
          },
        ]

    return (
      <section className={cn('bg-muted/40 py-20', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-1/6 right-1/6 top-16 hidden h-0.5 bg-border md:block"
            />
            {items.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="relative z-10 mx-auto mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
