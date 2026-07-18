import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepItem, StepContent } from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ResumeCvWork — vertical experience timeline for a personal resume / CV /
 * portfolio site. A left-aligned `SectionHeading` ("Experience" / "Where I've
 * worked") leads into a border-left timeline of roles, each marked by a token
 * dot and showing a bold role title, the company, a muted date range, and two
 * or three bullet-point accomplishments. Clean, scannable, and professional.
 * Use on a personal portfolio, online résumé, or professional profile page to
 * present work history. Renders fully with no props via baked-in defaults.
 */
export const ResumeCvWork = defineCapsule({
  name: 'ResumeCvWork',
  description:
    "Vertical experience timeline for a personal resume / CV / portfolio site: a left-aligned SectionHeading ('Experience' / 'Where I've worked') leads into a border-left timeline of roles, each marked by a token dot and showing a bold role title, the company, a muted date range, and two or three bullet-point accomplishments. Clean, scannable, professional. Use on a personal portfolio, online résumé, or professional profile page to present work history.",
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
      <section className={cn('bg-background', props.className)}>
        <Container size="sm" className="px-6 py-24 lg:px-6 lg:py-28">
          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'Experience'}
            subtitle={props.subheading ?? "Where I've worked"}
          />

          <ol className="mt-12 space-y-10 border-l border-border pl-8">
            {jobs.map((job, i) => (
              <StepItem key={i}>
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.3rem] top-1.5 size-3 rounded-full border-2 border-background bg-primary"
                />
                <StepContent className="mt-0 gap-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.role}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {job.dateRange}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {job.company}
                  </p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {job.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
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
