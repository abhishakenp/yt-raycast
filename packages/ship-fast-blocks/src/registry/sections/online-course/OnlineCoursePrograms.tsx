import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProgramCard } from '#/section-kit/ProgramGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * OnlineCoursePrograms — "Curriculum LMS" module ledger for an online-course
 * page. An asymmetric header (left-aligned SectionHeading beside a decorative
 * div-built syllabus progress bar with a mono "[ SELF-PACED ]" readout) sits
 * above a single sharp-cornered, collapsed-border module ledger: each row
 * carries a mono `MOD 01` index, a ghost corner numeral, the module title over
 * a per-module progress-tick strip that fills as the curriculum advances, and a
 * tabular-nums lessons count on the right. A giant ghost module-total watermark
 * bleeds behind, and a mono summary line totals the modules and lessons. Use to
 * lay out a self-paced course syllabus on an e-learning, bootcamp, or academy
 * landing page. Renders fully with no props via baked-in defaults.
 */
export const OnlineCoursePrograms = defineCapsule({
  name: 'OnlineCoursePrograms',
  description:
    "Curriculum-LMS module ledger for an online-course page: an asymmetric header (left-aligned heading beside a div-built syllabus progress bar with a mono '[ SELF-PACED ]' readout) above a single sharp-cornered collapsed-border module ledger. Each row carries a mono 'MOD 01' index, a ghost corner numeral, the module title over a per-module progress-tick strip, and a tabular-nums lessons count on the right, over a giant ghost module-total watermark, with a mono summary line totaling modules and lessons. Use to lay out a self-paced course syllabus on an e-learning, bootcamp, or academy landing page.",
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
    const total = modules.length

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 text-foreground lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-6 font-mono text-[9rem] sm:text-[15rem]">
          {String(total).padStart(2, '0')}
        </Watermark>
        <Container size="md" className="relative">
          <div className="mb-10 grid items-end gap-6 lg:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              subtitleClassName="text-base text-muted-foreground"
            />
            <div
              aria-hidden="true"
              className="hidden w-full max-w-xs justify-self-end lg:col-span-4 lg:block"
            >
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>[ self-paced ]</span>
                <span className="text-primary tabular-nums">
                  {String(total).padStart(2, '0')} mod
                </span>
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: total }).map((_, j) => (
                  <span key={j} className="h-1.5 flex-1 bg-primary/70" />
                ))}
              </div>
            </div>
          </div>
          <ProgramCard variant="default" className="rounded-none border-border">
            {modules.map((module, i) => (
              <div
                key={module.title}
                className={cn(
                  'group relative flex items-center gap-4 px-5 py-5 transition-colors hover:bg-muted/40 sm:gap-6 sm:px-7',
                  i > 0 && 'border-t border-border',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-2 select-none font-mono text-5xl font-bold leading-none text-foreground/[0.04]"
                >
                  {module.number ?? String(i + 1).padStart(2, '0')}
                </span>
                <MonoTag
                  tone="primary"
                  className="shrink-0 tabular-nums sm:text-xs"
                >
                  mod {module.number ?? String(i + 1).padStart(2, '0')}
                </MonoTag>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold tracking-tight text-card-foreground">
                    {module.title}
                  </p>
                  <span aria-hidden="true" className="mt-2 flex gap-1">
                    {Array.from({ length: total }).map((_, j) => (
                      <span
                        key={j}
                        className={cn(
                          'h-1 w-3 sm:w-5',
                          j <= i ? 'bg-primary/70' : 'bg-border',
                        )}
                      />
                    ))}
                  </span>
                </div>
                <span className="relative shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                  {module.lessons}
                </span>
              </div>
            ))}
          </ProgramCard>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              +{' '}
            </span>
            {summary}
          </p>
        </Container>
      </section>
    )
  },
})
