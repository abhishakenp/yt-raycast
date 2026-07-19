import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProgramCard } from '#/section-kit/ProgramGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * OnlineCoursePrograms — bespoke curriculum-modules band for an online-course
 * page. A centered SectionHeading ("Course curriculum") sits above a stacked
 * list of numbered module rows rendered as a single bordered card: each row
 * shows a rounded primary-tinted number badge, the module title, and a lessons
 * count, separated by token border dividers. A muted summary line below totals
 * the modules and lessons. Use to lay out a self-paced course syllabus on an
 * e-learning, bootcamp, or academy landing page. Renders fully with no props
 * via baked-in defaults.
 */
export const OnlineCoursePrograms = defineCapsule({
  name: 'OnlineCoursePrograms',
  description:
    "Bespoke curriculum-modules band for an online-course page: a centered SectionHeading ('Course curriculum') above a stacked list of numbered module rows in a single bordered card, each with a rounded primary-tinted number badge, the module title, and a lessons count, divided by token borders, plus a muted summary line totaling modules and lessons. Use to lay out a self-paced course syllabus on an e-learning, bootcamp, or academy landing page.",
  props: z.object({
    /** Eyebrow label above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Curriculum modules: optional number, title, and lessons count. */
    modules: z
      .array(
        z.object({
          number: z.string().optional(),
          title: z.string(),
          lessons: z.string(),
        }),
      )
      .optional(),
    /** Summary line under the module list. */
    summary: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Syllabus'
    const heading = props.heading ?? 'Course curriculum'
    const subheading =
      props.subheading ??
      'Six guided modules take you from fundamentals to shipping production apps — learn by building, at your own pace.'
    const modules = props.modules?.length
      ? props.modules
      : [
          { title: 'Foundations of React', lessons: '8 lessons' },
          { title: 'Components, Props & State', lessons: '10 lessons' },
          { title: 'Hooks & Side Effects', lessons: '9 lessons' },
          { title: 'Routing & Data Fetching', lessons: '11 lessons' },
          { title: 'Testing & Best Practices', lessons: '7 lessons' },
          { title: 'Capstone: Ship a Real App', lessons: '6 lessons' },
        ]
    const summary =
      props.summary ??
      `${modules.length} modules · 51 lessons · ~24 hours of content`

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="sm" className="px-6 lg:px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <ProgramCard
            variant="default"
            className="mt-12 overflow-hidden rounded-2xl"
          >
            {modules.map((module, i) => (
              <div
                key={module.title}
                className={cn(
                  'flex items-center gap-4 px-5 py-5 sm:px-6',
                  i > 0 && 'border-t border-border',
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {module.number ?? String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-base font-medium text-card-foreground">
                  {module.title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {module.lessons}
                </span>
              </div>
            ))}
          </ProgramCard>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {summary}
          </p>
        </Container>
      </section>
    )
  },
})
