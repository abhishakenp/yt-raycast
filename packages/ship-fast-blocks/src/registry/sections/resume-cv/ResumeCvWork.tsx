import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepItem, StepContent } from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ResumeCvWork — experience ledger for a personal resume / CV / portfolio site,
 * built like a résumé's EXPERIENCE section. A mono metadata rail ("02 /
 * EXPERIENCE") and hairline rule lead into a collapsed-border ledger of roles:
 * each row is an asymmetric split with a left mono index + tabular-nums date
 * column ("2021 — PRESENT") and a right column carrying an extrabold role title,
 * a mono uppercase company byline, and two or three bullet accomplishments.
 * Hairline rules between rows, tokens only, scannable and document-like. Use on a
 * personal portfolio, online résumé, or professional profile page to present
 * work history. Renders fully with no props via baked-in defaults.
 */
export const ResumeCvWork = defineCapsule({
  name: 'ResumeCvWork',
  description:
    "Experience ledger for a personal resume / CV / portfolio site, built like a résumé's EXPERIENCE section: a mono '02 / EXPERIENCE' metadata rail and hairline rule above a collapsed-border ledger of roles, each row an asymmetric split with a left mono index + tabular-nums date column ('2021 — PRESENT') and a right column carrying an extrabold role title, a mono uppercase company byline, and two or three bullet accomplishments. Hairline rules between rows, tokens only, scannable and document-like. Use on a personal portfolio, online résumé, or professional profile page to present work history.",
  props: z.object({
    /** Small eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading title. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
    /** Timeline of jobs, each role + company + date range + bullets. */
    jobs: z
      .array(
        z.object({
          role: z.string(),
          company: z.string(),
          dateRange: z.string(),
          bullets: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const jobs = props.jobs?.length
      ? props.jobs
      : [
          {
            role: 'Senior Product Designer',
            company: 'Northwind Labs',
            dateRange: '2021 — Present',
            bullets: [
              'Led design for the core analytics platform used by 40k+ daily users.',
              'Built and shipped a token-based design system adopted across six product teams.',
              'Mentored three junior designers and ran the weekly design critique.',
            ],
          },
          {
            role: 'Product Designer',
            company: 'Cobalt Health',
            dateRange: '2018 — 2021',
            bullets: [
              'Redesigned the patient onboarding flow, lifting completion by 32%.',
              'Partnered with research to run usability studies on clinical workflows.',
            ],
          },
          {
            role: 'UX Designer',
            company: 'Brightside Studio',
            dateRange: '2016 — 2018',
            bullets: [
              'Designed responsive marketing sites and apps for early-stage startups.',
              "Established the studio's first shared component library in Figma.",
            ],
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Container size="sm" className="relative px-6 py-24 lg:px-6 lg:py-28">
          {/* Giant faint section-index watermark. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 right-0 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[9rem] sm:text-[12rem]"
          >
            02
          </span>

          {/* Mono metadata rail. */}
          <div className="relative flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              02 / Experience
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'Experience'}
            subtitle={props.subheading ?? "Where I've worked"}
            className="relative mt-6 gap-2"
            titleClassName="text-3xl font-extrabold tracking-tighter text-foreground md:text-4xl"
            subtitleClassName="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          />

          <ol className="relative mt-12 border-t border-border">
            {jobs.map((job, i) => (
              <StepItem
                key={i}
                className="grid grid-cols-1 gap-3 border-b border-border py-8 md:grid-cols-[11rem_1fr] md:gap-10"
              >
                <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-2">
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs font-semibold tabular-nums text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.14em] tabular-nums text-muted-foreground">
                    {job.dateRange}
                  </span>
                </div>
                <StepContent className="mt-0 gap-0">
                  <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                    {job.role}
                  </h3>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                    {job.company}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {job.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1 shrink-0 bg-foreground/40"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </StepContent>
              </StepItem>
            ))}
          </ol>
        </Container>
      </section>
    )
  },
})
